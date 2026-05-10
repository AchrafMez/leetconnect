import { Router } from "express";
import { addProposal, getJobProposals, getMyProposals, acceptProposal, rejectProposal } from "../controllers/proposals";
import { authMiddleware, requireType } from "@leetconnect/shared";
import { validateProposal, validateIdParam } from "../middlewares/validate";

const router = Router();

router.get("/my-proposals", authMiddleware, getMyProposals);
router.post("/:jobId", authMiddleware, requireType("FREELANCER"), validateIdParam("jobId"), validateProposal, addProposal);
router.get("/:jobId", authMiddleware, validateIdParam("jobId"), getJobProposals);
router.patch("/accept/:id", authMiddleware, validateIdParam("id"), acceptProposal);
router.patch("/reject/:id", authMiddleware, validateIdParam("id"), rejectProposal);

export default router;
