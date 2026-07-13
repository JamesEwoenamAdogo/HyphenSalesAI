import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./Config/DbConfig.js";

import authRoutes from "./Routes/userRoutes.js";
// import chatRoute from "./Routes/chatRoute.js"

import { chatRouter } from "./Routes/chatRoute.js";


dotenv.config();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Database connection
connectDB();


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRouter);


// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "AI Sales Agent API is running 🚀",
  });
});


// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});