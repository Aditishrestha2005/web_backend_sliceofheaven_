// import { Request, Response } from "express";
// import { PizzaModel } from "../models/pizza.model";

// export class PizzaController {
//   async create(req: Request, res: Response) {
//     try {
//       const { name, description, price, category } = req.body;

//       const file = (req as any).file;

//       if (!file) {
//         return res.status(400).json({
//           success: false,
//           message: "Pizza image is required (field name must be: image)",
//         });
//       }

//       const pizza = await PizzaModel.create({
//         name,
//         description,
//         price: Number(price),
//         category,
//         image: `/uploads/pizzas/${file.filename}`, // ✅ this is the fix
//       });

//       return res.status(201).json({
//         success: true,
//         data: pizza,
//       });
//     } catch (error: any) {
//       return res.status(500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   async getAll(req: Request, res: Response) {
//     try {
//       const pizzas = await PizzaModel.find().sort({ createdAt: -1 });
//       return res.status(200).json({ success: true, data: pizzas });
//     } catch (error: any) {
//       return res.status(500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }
// }
import { Request, Response } from "express";
import { PizzaModel } from "../models/pizza.model";

export class PizzaController {
  async create(req: Request, res: Response) {
    try {
      const { name, description, price, category } = req.body;
      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Pizza image is required (field name must be: image)",
        });
      }

      const pizza = await PizzaModel.create({
        name,
        description,
        price: Number(price),
        category,
        image: `/uploads/pizzas/${file.filename}`,
      });

      return res.status(201).json({
        success: true,
        data: pizza,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const pizzas = await PizzaModel.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: pizzas });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ✅ DELETE BY ID (NEW)
  async deleteById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deletedPizza = await PizzaModel.findByIdAndDelete(id);

      if (!deletedPizza) {
        return res.status(404).json({
          success: false,
          message: "Pizza not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Pizza deleted successfully",
        data: deletedPizza,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
