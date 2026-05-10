import { Router } from 'express';
import { register, login, refresh, logout, updateProfile, changePassword } from '../controllers/auth.controller';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '@leetconnect/shared';
import prisma from '../lib/prisma';
import {updateProfileValidator, changePasswordValidator} from '../validators/profileValidator'
import { upload } from '../middlewares/upload';
import { uploadAvatar } from '../controllers/auth.controller';
import { rateLimit , ipKeyGenerator} from 'express-rate-limit';
import * as twoFA from '../controllers/twoFA.controller';
import { handleOAuthSuccess } from '../controllers/oauth.controller';
import passport from 'passport';
import '../lib/passport';
import { JwtPayload } from '@leetconnect/shared';


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
    message: { error: 'Too many password change attemps, please try again later' },
    keyGenerator: (req): string => {
      const authUser = req.user as JwtPayload | undefined;
      return authUser?.userId
        ? String(authUser.userId)
        : ipKeyGenerator(req.ip ?? '');
    },
});

router.post('/change-password', authMiddleware, changePasswordLimit ,changePasswordValidator, validate, changePassword);

// rate limiter for avatar upload
const avatarUploadLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many avatar upload attempts, please try again later' }
});

// Avatar change
router.post('/avatar', authMiddleware, avatarUploadLimit, upload.single('avatar'), uploadAvatar);

// 2FA rate limiter
const twoFALimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5,
    message: { error: 'Too many 2FA attempts, please try again later.' },
    keyGenerator: (req): string => {
      const authUser = req.user as JwtPayload | undefined;
      return authUser?.userId
        ? String(authUser.userId)
        : ipKeyGenerator(req.ip ?? '');
    },
});

// 2FA routes
router.post('/2fa/setup', authMiddleware, twoFALimiter, twoFA.setup2FA);
router.post('/2fa/verify', authMiddleware, twoFALimiter, twoFA.verifyAndEnable2FA);
router.post('/2fa/disable', authMiddleware, twoFALimiter, twoFA.disable2FA);

const twoFALoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many 2FA login attempts, please try again later.' }
});

router.post('/2fa/login', twoFALoginLimiter, twoFA.login2FA); // NO authMiddleware (user is mid-login, not authenticated yet)

// 42 oauth
router.get('/42', passport.authenticate('42', { session: false }));
router.get('/42/callback', 
    passport.authenticate('42', { session: false, failureRedirect: '/auth/sign-in' }),
    handleOAuthSuccess 
);


// test auth middleware 
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const authUser = req.user as JwtPayload;

    // Guard against missing userId
    if (!authUser?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Get full user data from database using userId from token
    const user = await prisma.user.findUnique({
      where: { id: authUser?.userId },
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
        bio: true,
        location: true,
        website: true,
        title: true,
        createdAt: true,
        twoFAEnabled: true,
        oauthProvider: true,
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