import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const controller = new OrderController();

// ✅ USER: create order
router.post("/", authorizedMiddleware, (req, res) => controller.create(req, res));

// ✅ USER: get my orders 
router.get("/my", authorizedMiddleware, (req, res) =>
  controller.getMyOrders(req, res)
);

// ✅ USER: cancel order (ONLY if Pending)
router.patch("/:id/cancel", authorizedMiddleware, (req, res) =>
  controller.cancel(req, res)
);

export default router;