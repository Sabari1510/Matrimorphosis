import { Router } from "express";
import {
  createRequest,
  getRequestsByResident,
  getRequestsByTechnician,
  updateRequestStatus,
} from "../controllers/request.controller";

const router = Router();

router.post("/", createRequest);
router.get("/resident/:residentId", getRequestsByResident);
router.get("/technician/:technicianId", getRequestsByTechnician);
router.put("/:requestId/status", updateRequestStatus);



export default router;
