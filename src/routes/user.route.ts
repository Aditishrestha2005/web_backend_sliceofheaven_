import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const userController = new UserController();

// ✅ Register (parse multipart fields too)
router.post(
  "/register",
  uploads.none(), // ✅ THIS parses multipart/form-data text fields
  (req, res) => userController.register(req, res)
);

// Login
router.post("/login", (req, res) => userController.login(req, res));

// Who am I
router.get("/whoami", authorizedMiddleware, (req, res) =>
  userController.getProfile(req, res)
);

// Update profile route with file upload
router.post(
  "/update-profile",
  authorizedMiddleware,
  uploads.single("profilePicture"),
  (req, res) => userController.updateProfile(req, res)
);

router.post("/request-password-reset", userController.sendResetPasswordEmail);
router.post("/reset-password/:token", userController.resetPassword);

export default router;
