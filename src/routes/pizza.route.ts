// import { Router } from "express";
// import { PizzaController } from "../controllers/pizza.controller";
// import { pizzaUploads } from "../middlewares/upload.middleware";

// const router = Router();
// const controller = new PizzaController();

// // ✅ IMPORTANT: multer must be here
// router.post("/", pizzaUploads.single("image"), (req, res) =>
//   controller.create(req, res)
// );

// // ✅ DELETE pizza by id
// router.delete("/:id", (req, res) => pizzaController.deleteById(req, res));
// router.get("/", (req, res) => controller.getAll(req, res));

// export default router;


import { Router } from "express";
import { PizzaController } from "../controllers/pizza.controller";
import { pizzaUploads } from "../middlewares/upload.middleware";

const router = Router();
const controller = new PizzaController();

// CREATE pizza
router.post("/", pizzaUploads.single("image"), (req, res) =>
  controller.create(req, res)
);

// GET all pizzas
router.get("/", (req, res) =>
  controller.getAll(req, res)
);

// DELETE pizza by id
router.delete("/:id", (req, res) =>
  controller.deleteById(req, res)
);

export default router;
