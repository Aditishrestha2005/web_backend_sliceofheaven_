// import express, { Application, Request, Response, NextFunction } from "express";
// import bodyParser from "body-parser";
// import cors from "cors";
// import path from "path";
// import dotenv from "dotenv";
// dotenv.config();
// import { connectDatabase } from "./database/mongodb";
// import { PORT } from "./config";
// import { HttpError } from "./error/http-error";
// import authRoutes from "./routes/user.route";
// import adminUserRoutes from "./routes/admin/user.route";
// import pizzaRoutes from "./routes/pizza.route";
// const app: Application = express();

// const corsOptions = {
//   origin: ["http://localhost:3000", "http://localhost:3003", "http://localhost:3005"],
//   optionsSuccessStatus: 200,
//   credentials: true,
// };


// app.use(cors(corsOptions));

// // ✅ Serve uploads folder correctly
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use("/api/auth", authRoutes);
// app.use("/api/admin/users", adminUserRoutes);

// app.get("/", (req: Request, res: Response) => {
//   return res.status(200).json({
//     success: true,
//     message: "Welcome to the API",
//   });
// });

// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   if (err instanceof HttpError) {
//     return res.status(err.statusCode).json({ success: false, message: err.message });
//   }
//   return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
// });

// app.use("/api/pizzas", pizzaRoutes);

// export default app;

// import express, { Application, Request, Response, NextFunction } from "express";
// import bodyParser from "body-parser";
// import cors from "cors";
// import path from "path";
// import dotenv from "dotenv";
// dotenv.config();

// import { HttpError } from "./error/http-error";

// import authRoutes from "./routes/user.route";
// import adminUserRoutes from "./routes/admin/user.route";
// import pizzaRoutes from "./routes/pizza.route";
// import orderRoutes from "./routes/order.route";

// const app: Application = express();

// const corsOptions = {
//   origin: [
//     "http://localhost:3000",
//     "http://localhost:3003",
//     "http://localhost:3005",
//   ],
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

// app.use(cors(corsOptions));

// /**
//  * ✅ Body parsing
//  * (Keeping your bodyParser + adding express.json for safety)
//  */
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// /**
//  * ✅ Serve uploaded files
//  * Example URL:
//  * http://localhost:5000/uploads/pizzas/<filename>
//  */
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// /**
//  * ✅ Routes
//  */
// app.use("/api/auth", authRoutes);
// app.use("/api/admin/users", adminUserRoutes);
// app.use("/api/pizzas", pizzaRoutes);
// app.use("/api/orders", orderRoutes);

// /**
//  * ✅ Root
//  */
// app.get("/", (req: Request, res: Response) => {
//   return res.status(200).json({
//     success: true,
//     message: "Welcome to the API",
//   });
// });

// /**
//  * ✅ 404 handler (route not found)
//  * This runs only if no route above matched.
//  */
// app.use((req: Request, res: Response) => {
//   return res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.originalUrl}`,
//   });
// });

// /**
//  * ✅ Error handler (must be LAST)
//  */
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   if (err instanceof HttpError) {
//     return res.status(err.statusCode).json({
//       success: false,
//       message: err.message,
//     });
//   }

//   return res.status(500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// export default app;




import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { HttpError } from "./error/http-error";

// Routes
import authRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import pizzaRoutes from "./routes/pizza.route";
import orderRoutes from "./routes/order.route";
import adminOrderRoutes from "./routes/admin/order.route";

const app: Application = express();

/**
 * ✅ CORS
 */
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3003",
    "http://localhost:3005",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

/**
 * ✅ Body parsing
 */
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * ✅ Serve uploaded files
 * Example:
 * http://localhost:5000/uploads/pizzas/<filename>
 */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/**
 * =============================
 * ✅ ROUTES
 * =============================
 */

// Auth
app.use("/api/auth", authRoutes);

// Admin users
app.use("/api/admin/users", adminUserRoutes);

// Pizzas (public GET, admin create/delete inside route protection)
app.use("/api/pizzas", pizzaRoutes);

// Orders (USER)
app.use("/api/orders", orderRoutes);

// Orders (ADMIN)
app.use("/api/admin/orders", adminOrderRoutes);

/**
 * ✅ Root route
 */
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

/**
 * ✅ 404 handler
 */
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/**
 * ✅ Global error handler (must be last)
 */
app.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
);

export default app;
