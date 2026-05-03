import { Request, Response, NextFunction } from 'express';
import { authenticator } from '@otplib/v12-adapter';
import QRCode from 'qrcode';
import prisma from '../lib/prisma';

// GENERATE SECRET and QR CODE
export const setup2FA = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (user?.twoFAEnabled) {
            return res.status(400).json({ error: "2FA is already enabled" });
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
        const userId = req.user!.userId;
        const { code } = req.body;

        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            select: { twoFASecret: true } 
        });

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
    const userId = req.user!.userId;
    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFASecret: true, twoFAEnabled: true },
    });

    if (!user?.twoFAEnabled || !user.twoFASecret) {
      return res.status(400).json({ error: "2FA is not enabled" });
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFASecret,
    }); // usage matches otplib

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
