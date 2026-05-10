import { Router } from "express";
import {
  addJob,
  getAllJobs,
  getMyJobs,
  getSingleJob,
  updateJob,
  deleteJob,
  pay,
  getPaymentById,
  submitReview,
  getUserReviews,
  completeJob
} from "../controllers/jobs";
import { authMiddleware, requireType } from "@leetconnect/shared";
import { validateJob, validateJobUpdate, validateReview, validateIdParam } from "../middlewares/validate";

const router = Router();

// Job CRUD
router.post("/", authMiddleware, requireType("CLIENT"), validateJob, addJob);
router.get("/my-jobs", authMiddleware, getMyJobs);
router.get("/", getAllJobs);
router.get("/:id", validateIdParam("id"), getSingleJob);
router.put("/:id", authMiddleware, validateIdParam("id"), validateJobUpdate, updateJob);
router.delete("/:id", authMiddleware, validateIdParam("id"), deleteJob);
router.post("/:id/complete", authMiddleware, validateIdParam("id"), completeJob);

// Payments
router.get("/payments/:id", authMiddleware, validateIdParam("id"), getPaymentById);
router.post("/payments/:id/pay", authMiddleware, validateIdParam("id"), pay);

// Reviews
router.post("/reviews", authMiddleware, validateReview, submitReview);
router.get("/reviews/user/:userId", validateIdParam("userId"), getUserReviews);

export default router;
