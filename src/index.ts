import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import { connectToDB } from "./config/mongoose";
import router from "./routes";
import { clerkMiddleware } from "@clerk/express";

const app: Application = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 9000;

const allowedOrigins = ["http://localhost:3000"];

// Database connection
connectToDB();

// Middleware setup
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes (before auth middleware)
app.use("/api", router);

// Clerk middleware (after public routes)
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  })
);

// Error handler (must be after routes)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on: PORT-${PORT}`);
});
