import { Request, Response } from "express";
import { db } from "../db/mysql";

export const createRequest = async (req: Request, res: Response) => {
  try {
    const { resident_id, category, description } = req.body;
    // If file uploaded via multer, use its path
    const file = (req as any).file;
    const media = file ? `/uploads/${file.filename}` : req.body.media || null;

    const allowedCategories = ["Plumbing", "Electrical", "Painting", "Other"];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message:
          "Invalid category. Allowed values: Plumbing, Electrical, Painting, Other",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO requests (resident_id, category, description, media, status) VALUES (?, ?, ?, ?, ?)",
      [resident_id, category, description, media, "New"]
    );

    const insertedId = (result as any).insertId;

    return res.status(201).json({
      message: "Maintenance request created successfully",
      id: insertedId,
    });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({
      message: "Failed to create maintenance request",
    });
  }
};
export const getRequestsByResident = async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;

    const [rows] = await db.execute(
      "SELECT * FROM requests WHERE resident_id = ? ORDER BY created_at DESC",
      [residentId]
    );

    return res.status(200).json({
      message: "Request history fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Fetch request history error:", error);
    return res.status(500).json({
      message: "Failed to fetch request history",
    });
  }
};
export const getRequestsByTechnician = async (req: Request, res: Response) => {
  try {
    const { technicianId } = req.params;

    const [rows] = await db.execute(
      "SELECT * FROM requests WHERE technician_id = ? ORDER BY created_at DESC",
      [technicianId]
    );

    return res.status(200).json({
      message: "Assigned requests fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Fetch technician requests error:", error);
    return res.status(500).json({
      message: "Failed to fetch technician requests",
    });
  }
};
export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    // Support multipart/form-data with files and notes
    const status = req.body.status;
    const technician_notes = req.body.technician_notes || null;

    // Debug/logging to help diagnose missing DB updates
    console.log("UpdateStatus payload:", { requestId, body: req.body });
    console.log(
      "Files present:",
      (req as any).files ? (req as any).files.length : 0
    );

    const allowedStatus = ["Assigned", "In-Progress", "Resolved"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // If files uploaded via multer (technician_media), store paths as JSON string
    // Collect technician_media either from uploaded files or from body (if client sent paths)
    const files = (req as any).files as Express.Multer.File[] | undefined;
    let technician_media: string | null = null;

    if (files && files.length > 0) {
      const paths = files.map((f) => `/uploads/${f.filename}`);
      technician_media = JSON.stringify(paths);
    } else if (req.body.technician_media) {
      // If client provided a JSON string or comma-separated paths
      try {
        if (typeof req.body.technician_media === "string") {
          // if it's already a JSON array string, keep it; otherwise wrap single path
          const maybe = req.body.technician_media;
          if (maybe.trim().startsWith("[")) {
            technician_media = maybe;
          } else {
            // single path or comma-separated
            const arr = maybe.includes(",")
              ? maybe.split(",").map((s: string) => s.trim())
              : [maybe.trim()];
            technician_media = JSON.stringify(arr);
          }
        } else if (Array.isArray(req.body.technician_media)) {
          technician_media = JSON.stringify(req.body.technician_media);
        }
      } catch (e) {
        console.error("Failed to parse technician_media from body", e);
      }
    }

    await db.execute(
      "UPDATE requests SET status = ?, technician_notes = ?, technician_media = ? WHERE id = ?",
      [status, technician_notes, technician_media, requestId]
    );

    return res
      .status(200)
      .json({ message: "Request status updated successfully" });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({
      message: "Failed to update request status",
    });
  }
};
export const assignTechnician = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({
        message: "Technician ID is required",
      });
    }

    await db.execute(
      "UPDATE requests SET technician_id = ?, status = 'Assigned' WHERE id = ?",
      [technicianId, requestId]
    );

    return res.status(200).json({
      message: "Technician assigned successfully",
    });
  } catch (error) {
    console.error("Assign technician error:", error);
    return res.status(500).json({
      message: "Failed to assign technician",
    });
  }
};

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Check request status
    const [rows]: any = await db.execute(
      "SELECT status FROM requests WHERE id = ?",
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (rows[0].status !== "Resolved") {
      return res.status(400).json({
        message: "Feedback allowed only after request is resolved",
      });
    }

    await db.execute(
      "UPDATE requests SET feedback_rating = ?, feedback_comment = ? WHERE id = ?",
      [rating, comment || null, requestId]
    );

    return res.status(200).json({
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    return res.status(500).json({
      message: "Failed to submit feedback",
    });
  }
};
