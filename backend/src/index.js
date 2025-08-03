import express from "express";
import "dotenv/config"; // Allow using environment variables

import authRoutes from "./routes/authRoutes.js"; // Need .js extension here
import bookRoutes from "./routes/bookRoutes.js"; // Import book routes
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json()); // Middleware to parse JSON bodies

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});