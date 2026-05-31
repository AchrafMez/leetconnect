// helper file to make things easier :)

import jwt from 'jsonwebtoken'
import fs from 'fs'
import { JwtPayload } from '@leetconnect/shared'; 
import crypto from 'crypto';

// Read keys from direct ENV variables (Vercel Serverless) or fallback to file paths (Docker)
let privateKey: Buffer | string;
let publicKey: Buffer | string;

try {
    if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
        privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
        publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
    } else {
        privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH as string);
        publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH as string);
    }
} catch (err) {
    console.warn("JWT Keys could not be loaded at startup.", err);
}

export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m',
    issuer: 'leetconnect-auth',
    audience: 'leetconnect-services'
  });
};

export const generateRefreshToken = () => {
  // a long random string is better than a JWT for refresh tokens => opaque string 
  return crypto.randomBytes(40).toString('hex');
  
}

export const generateTempToken = (userId: string) => {
  return jwt.sign(
    { userId, pending2FA: true },
    privateKey,
    { 
      algorithm: 'RS256', 
      expiresIn: '5m',
      issuer: 'leetconnect-auth',
      audience: 'leetconnect-services'
    }
  );
};

export const verifyTempToken = (token: string): { userId: string; pending2FA: boolean } => {
  const payload = jwt.verify(token, publicKey, { 
    algorithms: ['RS256'],
    issuer: 'leetconnect-auth',
    audience: 'leetconnect-services'
  }) as any;

  if (!payload.pending2FA) {
    throw new Error('Invalid token type');
  }

  return payload;
};