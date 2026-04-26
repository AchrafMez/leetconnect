import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '@leetconnect/shared';
import prisma from '../lib/prisma';

const router = Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);


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