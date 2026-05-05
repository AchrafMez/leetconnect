// helper file to make things easier :)

import jwt from 'jsonwebtoken'
import fs from 'fs'
import { JwtPayload } from '@leetconnect/shared'; 
import crypto from 'crypto';

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH as string);
const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH as string);

export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m',
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
    { algorithm: 'RS256', expiresIn: '5m' }
  );
};

export const verifyTempToken = (token: string): { userId: string; pending2FA: boolean } => {
  const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as any;

  if (!payload.pending2FA) {
    throw new Error('Invalid token type');
  }

  return payload;
};