import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";
import { HttpError } from "./error/http-error";

import authRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";

const app: Application = express();

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3003", "http://localhost:3005"],
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Serve uploads folder correctly
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

export default app;