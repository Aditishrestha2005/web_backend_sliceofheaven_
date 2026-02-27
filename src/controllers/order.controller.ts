import { Request, Response } from "express";
import mongoose from "mongoose";
import { OrderModel, OrderStatus } from "../models/order.model";

export class OrderController {
  // ✅ USER: create order
  async create(req: Request, res: Response) {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { items, fullName, phone, address, note } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart items required",
        });
      }

      if (!fullName || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: "Delivery details required",
        });
      }

      const normalizedItems = items.map((item: any) => ({
        pizzaId: new mongoose.Types.ObjectId(item.pizzaId),
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      }));

      const totalAmount = normalizedItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      const order = await OrderModel.create({
        userId: user._id,
        items: normalizedItems,
        totalAmount,
        status: "Pending",
        fullName,
        phone,
        address,
        note,
      });

      return res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ✅ USER: get my orders
  async getMyOrders(req: Request, res: Response) {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const orders = await OrderModel.find({ userId: user._id }).sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ✅ USER: cancel my order (ONLY if Pending)
  async cancel(req: Request, res: Response) {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;

      // 1) Find the order owned by this user
      const order = await OrderModel.findOne({ _id: id, userId: user._id });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // 2) Allow cancel ONLY while Pending
      if (order.status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "You can cancel only before the order is accepted.",
        });
      }

      // 3) Update status
      order.status = "Cancelled";
      await order.save();

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ✅ ADMIN: get all orders
  async getAll(req: Request, res: Response) {
    try {
      const orders = await OrderModel.find().sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ✅ ADMIN: update order status
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: OrderStatus };

      const allowed: OrderStatus[] = [
        "Pending",
        "Accepted",
        "Preparing",
        "Delivered",
        "Cancelled",
      ];

      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const updatedOrder = await OrderModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedOrder,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}