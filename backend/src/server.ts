import express from "express";
import cors from "cors";
import { db } from "./db/mysql";
import requestRoutes from "./routes/request.routes";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-user-role"],
  })
);

app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Created uploads directory at", uploadsDir);
  }
} catch (err) {
  console.error("Failed to create uploads directory", err);
}

db.getConnection()
  .then(() => console.log("MySQL connected successfully"))
  .catch((err) => console.error("MySQL connection failed:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running");
});
app.use("/api/requests", requestRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Global error handler (handle multer and other errors)
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", err);
  if (err && err.message && err.message.includes("Only images")) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: "Internal server error" });
});
