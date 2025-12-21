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
      "INSERT INTO requests (resident_id, category, description, media) VALUES (?, ?, ?, ?)",
      [resident_id, category, description, media]
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



