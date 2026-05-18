import { Router } from "express";
import { addJob, getAllJobs, getMyJobs, getSingleJob, updateJob, deleteJob, pay, getPaymentById, submitReview, getUserReviews, completeJob } from "../controllers/jobs";
import { authMiddleware, requireType } from "@leetconnect/shared";
import { validateJob, validateJobUpdate, validateReview, validateIdParam } from "../middlewares/validate";
import { rateLimit , ipKeyGenerator } from "express-rate-limit";
const router = Router();

const browseLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 120,
  message: { message: 'Too many requests, please slow down'},
	standardHeaders: true,
	legacyHeaders: false,
  keyGenerator: (req) => {
	return (req as any).user?.userId ?? ipKeyGenerator(req.ip ?? '');
}
});


const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many modification requests' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
	return (req as any).user?.userId ?? ipKeyGenerator(req.ip ?? '');
}
});

// Job CRUD
router.post("/", authMiddleware, requireType("CLIENT"),  writeLimiter, validateJob, addJob);
router.get("/my-jobs", authMiddleware,   browseLimiter,getMyJobs);
router.get("/", browseLimiter, getAllJobs);
router.get("/:id", validateIdParam("id"),  browseLimiter, getSingleJob);
router.put("/:id", authMiddleware, validateIdParam("id"), validateJobUpdate, writeLimiter, updateJob);
router.delete("/:id", authMiddleware,  writeLimiter, validateIdParam("id"), deleteJob);
router.post("/:id/complete",  writeLimiter,authMiddleware, validateIdParam("id"), completeJob);

// Payments
router.get("/payments/:id",  browseLimiter,authMiddleware, validateIdParam("id"), getPaymentById);
router.post("/payments/:id/pay", writeLimiter, authMiddleware, validateIdParam("id"), pay);

// Reviews
router.post("/reviews", writeLimiter, authMiddleware, validateReview, submitReview);
router.get("/reviews/user/:userId", browseLimiter ,validateIdParam("userId"), getUserReviews);

export default router;
