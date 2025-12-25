import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  createRequest,
  getRequestsByResident,
  getRequestsByTechnician,
  updateRequestStatus,
  assignTechnician,
  submitFeedback,
} from "../controllers/request.controller";

const router = Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

// Accept common image/video MIME types
const allowedMime = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (req, file, cb) => {
    if (allowedMime.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only images and common video formats are allowed"));
  },
});

// Resident
router.post("/", upload.single("media"), createRequest);
router.get("/resident/:residentId", getRequestsByResident);

// Technician
router.get("/technician/:technicianId", getRequestsByTechnician);
router.put(
  "/:requestId/status",
  upload.array("technician_media", 5),
  updateRequestStatus
);

// Admin
router.put("/:requestId/assign", assignTechnician);

// Feedback
router.post("/:requestId/feedback", submitFeedback);

export default router;
