import { PizzaController } from "../../controllers/pizza.controller";
import { PizzaModel } from "../../models/pizza.model";

jest.mock("../../models/pizza.model", () => ({
  PizzaModel: {
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("PizzaController (unit)", () => {
  let controller: PizzaController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PizzaController();
  });

  describe("create", () => {
    it("returns 400 if image missing", async () => {
      const req: any = {
        body: { name: "Test", description: "D", price: "10", category: "veg" },
        file: undefined,
      };
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Pizza image is required"),
        })
      );
    });

    it("creates pizza and returns 201 with image path", async () => {
      const fakePizza = { _id: "p1", name: "Test Pizza" };
      (PizzaModel.create as jest.Mock).mockResolvedValue(fakePizza);

      const req: any = {
        body: {
          name: "Test Pizza",
          description: "Yum",
          price: "150",
          category: "veg",
        },
        file: { filename: "abc.png" },
      };
      const res = mockRes();

      await controller.create(req, res);

      expect(PizzaModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Pizza",
          description: "Yum",
          price: 150,
          category: "veg",
          image: "/uploads/pizzas/abc.png",
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakePizza });
    });

    it("returns 500 on exception", async () => {
      (PizzaModel.create as jest.Mock).mockRejectedValue(new Error("DB down"));

      const req: any = {
        body: { name: "Test", description: "D", price: "10", category: "veg" },
        file: { filename: "x.png" },
      };
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("getAll", () => {
    it("returns 200 and array", async () => {
      const sortMock = jest.fn().mockResolvedValue([{ _id: "p1" }]);
      (PizzaModel.find as jest.Mock).mockReturnValue({ sort: sortMock });

      const req: any = {};
      const res = mockRes();

      await controller.getAll(req, res);

      expect(PizzaModel.find).toHaveBeenCalled();
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ _id: "p1" }],
      });
    });

    it("returns 500 on exception", async () => {
      (PizzaModel.find as jest.Mock).mockImplementation(() => {
        throw new Error("boom");
      });

      const req: any = {};
      const res = mockRes();

      await controller.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("deleteById", () => {
    it("returns 404 if pizza not found", async () => {
      (PizzaModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const req: any = { params: { id: "nope" } };
      const res = mockRes();

      await controller.deleteById(req, res);

      expect(PizzaModel.findByIdAndDelete).toHaveBeenCalledWith("nope");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Pizza not found" })
      );
    });

    it("deletes pizza and returns 200", async () => {
      const deleted = { _id: "p1" };
      (PizzaModel.findByIdAndDelete as jest.Mock).mockResolvedValue(deleted);

      const req: any = { params: { id: "p1" } };
      const res = mockRes();

      await controller.deleteById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Pizza deleted successfully",
          data: deleted,
        })
      );
    });

    it("returns 500 on exception", async () => {
      (PizzaModel.findByIdAndDelete as jest.Mock).mockRejectedValue(
        new Error("fail")
      );

      const req: any = { params: { id: "p1" } };
      const res = mockRes();

      await controller.deleteById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });
});