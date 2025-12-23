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

// Resident
router.post("/", createRequest);
router.get("/resident/:residentId", getRequestsByResident);

// Technician
router.get("/technician/:technicianId", getRequestsByTechnician);
router.put("/:requestId/status", updateRequestStatus);

// Admin
router.put("/:requestId/assign", assignTechnician);

// Feedback
router.post("/:requestId/feedback", submitFeedback);

export default router;
