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
