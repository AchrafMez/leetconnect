import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { Role, UserType } from './constants';

const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH as string;

// We load the public key once on startup If it fails, the service won't start
let publicKey: Buffer;
try {
    publicKey = fs.readFileSync(publicKeyPath);
    console.log("JWT Public Key loaded successfully");
} catch (err) {
    console.warn("JWT Public Key not found at startup. Middleware will fail until it's provided.");
}

export interface JwtPayload { // put the least user info data => Least Privilege
  userId: string; // used userId for better clarity in the code when other services use it so its not confict with other ids
  role: Role; // admin , user ..
  type:UserType; // freelancer or client
}

// declaration merging
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// verifies the jwt token from authorization header
// ex: router.get('/profile', authMiddleware, handler)
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Malformed authorization header' });
  }

  try { // verify using asymmetric public key
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as unknown as JwtPayload;
    req.user = decoded; // contains token info like : id email username role
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// only allows specific roles
// ex: router.delete('/job', authMiddleware, requireRole('ADMIN', 'CLIENT'), handler)
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({
      error: 'Not authenticated'
    });
    if (!roles.includes(req.user.role))
      return res.status(403).json({
        error: 'Forbidden'
      });
    next();
  };
}

export function requireType(...types: UserType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !types.includes(req.user.type)) {
        return res.status(403).json({ error: 'Incorrect user type for this action' });
    }
    next();
  };
}

export { authMiddleware, requireRole};