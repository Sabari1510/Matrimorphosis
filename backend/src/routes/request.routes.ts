import { Router } from "express";
import {
  createRequest,
  getRequestsByResident,
  getRequestsByTechnician,
  updateRequestStatus,
  assignTechnician,
  submitFeedback,
} from "../controllers/request.controller";

const router = Router();

router.post("/", createRequest);
router.get("/resident/:residentId", getRequestsByResident);
router.get("/technician/:technicianId", getRequestsByTechnician);
router.put("/:requestId/status", updateRequestStatus);
router.put("/:requestId/assign", assignTechnician);
router.put("/:requestId/feedback", submitFeedback);





export default router;
