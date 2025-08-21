import express from "express";
import cors from "cors"; // Import CORS for cross-origin requests
import "dotenv/config"; // Allow using environment variables
import job from "./lib/cron.js"

import authRoutes from "./routes/authRoutes.js"; // Need .js extension here
import bookRoutes from "./routes/bookRoutes.js"; // Import book routes
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json({ limit: "10mb" })); // Increased limit for large payloads
app.use(cors()); // Enable CORS for all routes

job.start();
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});