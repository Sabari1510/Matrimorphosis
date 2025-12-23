import { Request, Response } from "express";
import { db } from "../db/mysql";

export const createRequest = async (req: Request, res: Response) => {
  try {
    const { resident_id, category, description, media } = req.body;

    const allowedCategories = ["Plumbing", "Electrical", "Painting", "Other"];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message:
          "Invalid category. Allowed values: Plumbing, Electrical, Painting, Other",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO requests (resident_id, category, description, media, status) VALUES (?, ?, ?, ?, ?)",
      [resident_id, category, description, media, 'New']
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
    const { status } = req.body;

    const allowedStatus = ["Assigned", "In-Progress", "Resolved"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    await db.execute("UPDATE requests SET status = ? WHERE id = ?", [
      status,
      requestId,
    ]);

    return res.status(200).json({
      message: "Request status updated successfully",
    });
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
    const { rating } = req.body;

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

    await db.execute("UPDATE requests SET feedback_rating = ? WHERE id = ?", [
      rating,
      requestId,
    ]);

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





