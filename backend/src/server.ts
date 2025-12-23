import express from "express";
import cors from "cors";
import { db } from "./db/mysql";
import requestRoutes from "./routes/request.routes";



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
