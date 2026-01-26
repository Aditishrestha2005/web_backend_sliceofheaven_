import { Router } from "express";
import { UserController } from "../controllers/user.controller"; // calls UserService

const router = Router();
const authController = new UserController();

// Bind methods so "this" works
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

export default router;
