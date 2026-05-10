import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { generateRefreshToken } from '../lib/token';
import dotenv from 'dotenv'

export const handleOAuthSuccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any; // Provided by Passport

        //  Create the Refresh Token session in DB
        const refreshToken = await prisma.refreshToken.create({
            data: {
                token: generateRefreshToken(),
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        });

        //  Set the HttpOnly Cookie
        res.cookie('refreshToken', refreshToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/api/auth/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //  Redirect back to Frontend
        // res.redirect(`https://localhost/dashboard`);
        const currentHost = req.get('host'); // e.g. "10.12.2.1"
        const protocol = req.protocol;       // e.g. "https"
        
        const frontendUrl = `${protocol}://${currentHost}`;
    
        res.redirect(`${frontendUrl}/dashboard`); // change to /freedashboard later
    } catch (error) {
        next(error);
    }
};