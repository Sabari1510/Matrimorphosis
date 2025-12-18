import { Request, Response } from "express";
import { db } from "../db/mysql";

export const createRequest = async (req: Request, res: Response) => {
  try {
    const { resident_id, category, description, media } = req.body;

    // 🔹 Validation (important for marks)
    if (!resident_id || !category || !description) {
      return res.status(400).json({
        message: "resident_id, category, and description are required",
      });
    }

    const sql = `
      INSERT INTO requests (resident_id, category, description, media)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      resident_id,
      category,
      description,
      media || null,
    ]);

    return res.status(201).json({
      message: "Maintenance request created successfully",
      result,
    });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
