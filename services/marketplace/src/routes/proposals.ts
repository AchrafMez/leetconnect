import { Router } from "express";
import {addProposal,getJobProposals,acceptProposal,rejectProposal} from "../controllers/proposals";
import { authMiddleware } from "@leetconnect/shared";

const router = Router();

router.post("/:jobId", authMiddleware  ,addProposal);
router.get("/:jobId", getJobProposals);
router.patch("/accept/:id", acceptProposal);
router.patch("/reject/:id", rejectProposal);

export default router;
