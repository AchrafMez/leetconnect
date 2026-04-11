import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole, ROLES } from '@leetconnect/shared';

const router = Router();

/**
 * PATH: GET /api/chat/test-identity
 * This route proves the Chat Service can identify the user
 * independently using the Public Key.
 */
router.get(
  '/test-identity', 
  authMiddleware, 
  (req: Request, res: Response) => {
    // req.user comes from your Declaration Merging in @leetconnect/shared
    res.status(200).json({
      message: "Chat service successfully verified your identity!",
      yourDetails: {
        userId: req.user!.userId,
        role: req.user!.role
      }
    });
  }
);

/**
 * PATH: GET /api/chat/test-freelancer-only
 * Proves that role-based access works across services.
 */
router.get(
  '/test-freelancer-only',
  authMiddleware,
  requireRole(ROLES.FREELANCER),
  (req: Request, res: Response) => {
    res.json({ message: "Hello Freelancer! You have access to this chat feature." });
  }
);

export default router;