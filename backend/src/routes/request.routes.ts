import { authorizeRoles } from "../middleware/role.middleware";
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

router.post("/", authorizeRoles(["Resident"]), createRequest);
router.get("/resident/:residentId", authorizeRoles(["Resident"]), getRequestsByResident);
router.get("/technician/:technicianId", authorizeRoles(["Technician"]), getRequestsByTechnician);
router.put("/:requestId/status", authorizeRoles(["Technician"]), updateRequestStatus);
router.put("/:requestId/assign", authorizeRoles(["Admin"]), assignTechnician);
router.put("/:requestId/feedback", authorizeRoles(["Resident"]), submitFeedback);


export default router;
