import { Request, Response, NextFunction } from 'express';
import { authenticator } from '@otplib/v12-adapter';
import QRCode from 'qrcode';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyTempToken } from '../lib/token';
import bcrypt from 'bcryptjs';
import { JwtPayload } from '@leetconnect/shared';

// GENERATE SECRET and QR CODE
export const setup2FA = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = req.user as JwtPayload; 
        const userId = authUser.userId; // From JWT
        const { password } = req.body; 

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user){
            return res.status(404).json({ error: "user not found"});
        }

        // Oauth user cannot enable 2fa
        if (user.oauthProvider || !user.password) {
            return res.status(403).json({error: "2FA settings are managed by your sign-in provider."});
        }
        
        if (user?.twoFAEnabled) {
            return res.status(400).json({ error: "2FA is already enabled" });
        }
        
        // check password
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        const isValidPassword = await bcrypt.compare(password, user!.password!);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Incorrect password" });
        }
    
        // Generate a 32-character secret
        const secret = authenticator.generateSecret();
        
        // Create the URI (Company Name: LeetConnect)
        const otpauth = authenticator.keyuri(user!.email, 'LeetConnect', secret);

        // Store secret temporarily in DB
        await prisma.user.update({
            where: { id: userId },
            data: { twoFASecret: secret }
        });

        // Generate QR Code as a Base64 string for the frontend
        const qrCodeImageUrl = await QRCode.toDataURL(otpauth);

        res.json({ qrCode: qrCodeImageUrl });
    } catch (error) {
        next(error);
    }
};

// VERIFY & ENABLE
export const verifyAndEnable2FA = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const authUser = req.user as JwtPayload; 
        const userId = authUser.userId;
        const { code } = req.body;

        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            select: { twoFASecret: true ,
                        password: true,
                        oauthProvider: true,
                    } 
        });

        if (!user){
            return res.status(404).json({ error: "user not found"});
        }

        if (user.oauthProvider || !user.password) {
            return res.status(403).json({error: "2FA settings are managed by your sign-in provider."});
        }
    
        if (!user?.twoFASecret) {
            return res.status(400).json({ error: "2FA setup not started" });
        }

        // Verify the 6-digit code
        const isValid = authenticator.verify({
            token: code,
            secret: user.twoFASecret
        });

        if (!isValid) {
            return res.status(400).json({ error: "Invalid verification code" });
        }
        

        // Officially enable 2FA
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { twoFAEnabled: true },
            select: { id: true, twoFAEnabled: true }
        });

        res.json({ message: "2FA enabled successfully", user: updatedUser });
    } catch (error) {
        next(error);
    }
};

// DISABLE 2FA
export const disable2FA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = req.user as JwtPayload; 
    const userId = authUser.userId; 
    const { code , password} = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId }} );
    if (!user){
        return res.status(404).json({ error: "user not found"});
    }


    // Oauth user cannot enable 2FA
    if (user.oauthProvider || !user.password) {
        return res.status(403).json({error: "2FA settings are managed by your sign-in provider."});
    }
    
    if (!user?.twoFAEnabled || !user.twoFASecret) {
      return res.status(400).json({ error: "2FA is not enabled" });
    }

    // check ifpassword is correct 
    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    const isValidPassword = await bcrypt.compare(password, user!.password!);
    
    if (!isValidPassword) {
        return res.status(401).json({ error: "Incorrect password" });
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFASecret,
    });

    if (!isValid) {
      return res.status(403).json({ error: "Invalid 2FA code" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFAEnabled: false, twoFASecret: null },
    });

    res.json({ message: "2FA disabled" });
  } catch (error) {
    next(error);
  }
};


// 2FA login
export const login2FA = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tempToken, code } = req.body;

        if (!tempToken || !code) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // Verify the temp token
        let payload: any;
        try {
            payload = verifyTempToken(tempToken);
        } catch {
            return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
        }

        // Must be a pending2FA token, not a real access token
        if (!payload.pending2FA) {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        // Get user + secret from DB
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                type: true,
                twoFASecret: true,
                twoFAEnabled: true,
                status: true,
            }
        });

        if (user && user.status === 'suspended') {
            return res.status(403).json({ error: 'Account suspended' });
        }

        if (!user || !user.twoFAEnabled || !user.twoFASecret) {
            return res.status(400).json({ error: '2FA not set up for this account' });
        }

        // Verify the 6-digit code
        const isValid = authenticator.verify({ token: code, secret: user.twoFASecret });
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid 2FA code' });
        }

        // if the code is correct now issue the REAL tokens
        const refreshToken = await prisma.refreshToken.create({
            data: {
                token: generateRefreshToken(),
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        });

        const accessToken = generateAccessToken({ userId: user.id, role: user.role, type: user.type });

        res.cookie('refreshToken', refreshToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/api/auth/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: `Welcome Back ${user.username}!`,
            accessToken,
            user: { id: user.id, email: user.email, username: user.username, role: user.role, type: user.type }
        });

    } catch (error) {
        next(error);
    }
};