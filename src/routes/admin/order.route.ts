import { Router } from "express";
import { OrderController } from "../../controllers/order.controller";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../../middlewares/authorized.middleware";

const router = Router();
const controller = new OrderController();

// ✅ ADMIN: get all orders
router.get(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  (req, res) => controller.getAll(req, res)
);

// ✅ ADMIN: update order status
router.patch(
  "/:id/status",
  authorizedMiddleware,
  adminMiddleware,
  (req, res) => controller.updateStatus(req, res)
);

export default router;
