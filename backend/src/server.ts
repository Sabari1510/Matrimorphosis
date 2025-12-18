import express from "express";
import cors from "cors";
import { db } from "./db/mysql";


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

db.getConnection()
  .then(() => console.log("MySQL connected successfully"))
  .catch((err) => console.error("MySQL connection failed:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
