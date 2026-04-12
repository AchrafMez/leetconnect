// helper file to make things easier :)

import jwt from 'jsonwebtoken'
import fs from 'fs'
import { JwtPayload } from '@leetconnect/shared'; 

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH as string);

export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m',
  });
};

export const generateRefreshToken = () => {
  // a long random string is better than a JWT for refresh tokens => opaque string 
  return require('crypto').randomBytes(40).toString('hex');
};
