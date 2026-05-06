import { Router } from 'express';
import { register, login, refresh, logout, updateProfile, changePassword } from '../controllers/auth.controller';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '@leetconnect/shared';
import prisma from '../lib/prisma';
import {updateProfileValidator, changePasswordValidator} from '../validators/profileValidator'
import { upload } from '../middlewares/upload';
import { uploadAvatar } from '../controllers/auth.controller';
import { rateLimit } from 'express-rate-limit';
import * as twoFA from '../controllers/twoFA.controller';

const router = Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.patch('/settings', authMiddleware, updateProfileValidator, validate, updateProfile );

// rate limit for changing password
const changePasswordLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: { error: 'Too password change attemps, please try again later' },
    keyGenerator: (req): string => req.user?.userId ?? req.ip ?? 'uknown', // check security 
});

router.post('/change-password', authMiddleware, changePasswordLimit ,changePasswordValidator, validate, changePassword);

// rate limiter for avatar upload
const avatarUploadLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many password change attempts, please try again later' }
});

// Avatar change
router.post('/avatar', authMiddleware, avatarUploadLimit, upload.single('avatar'), uploadAvatar);

// 2FA rate limiter
const twoFALimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5,
    message: { error: 'Too many attempts, please try again later.' }
});

// 2FA routes
router.post('/2fa/setup', authMiddleware, twoFALimiter, twoFA.setup2FA);
router.post('/2fa/verify', authMiddleware, twoFALimiter, twoFA.verifyAndEnable2FA);
router.post('/2fa/disable', authMiddleware, twoFALimiter, twoFA.disable2FA);
router.post('/2fa/login',  twoFALimiter, twoFA.login2FA); // NO authMiddleware (user is mid-login, not authenticated yet)

// test auth middleware 
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Guard against missing userId
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Get full user data from database using userId from token
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        avatar: true,
        role: true,
        type: true,
        isOnline: true,
        createdAt: true,
        bio: true,
        location: true,
        website: true,
        title: true,
        twoFAEnabled: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;