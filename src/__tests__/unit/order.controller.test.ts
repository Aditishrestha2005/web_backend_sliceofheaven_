import { OrderController } from "../../controllers/order.controller";
import { OrderModel } from "../../models/order.model";
import mongoose from "mongoose";

jest.mock("../../models/order.model", () => ({
  OrderModel: {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("OrderController (unit)", () => {
  let controller: OrderController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new OrderController();
  });

  describe("create", () => {
    it("returns 401 if req.user missing", async () => {
      const req: any = { body: {} };
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it("returns 400 if items missing/empty", async () => {
      const req: any = {
        user: { _id: "u1" },
        body: { items: [], fullName: "A", phone: "9", address: "X" },
      };
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Cart items required" })
      );
    });

    it("returns 400 if delivery details missing", async () => {
      const req: any = {
        user: { _id: "u1" },
        body: { items: [{ pizzaId: "p1", price: 10, quantity: 1 }] },
      };
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Delivery details required" })
      );
    });

    it("creates order, computes totalAmount, returns 201", async () => {
      const createSpy = OrderModel.create as jest.Mock;

      const req: any = {
        user: { _id: "u1" },
        body: {
          items: [
            {
              pizzaId: "000000000000000000000001",
              name: "P1",
              price: 100,
              image: "/x.png",
              quantity: 2,
            },
            {
              pizzaId: "000000000000000000000002",
              name: "P2",
              price: 50,
              image: "/y.png",
              quantity: 1,
            },
          ],
          fullName: "John",
          phone: "9800",
          address: "Kathmandu",
          note: "leave at gate",
        },
      };

      const res = mockRes();

      const fakeOrder = { _id: "o1", totalAmount: 250, status: "Pending" };
      createSpy.mockResolvedValue(fakeOrder);

      await controller.create(req, res);

      // total = 100*2 + 50*1 = 250
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "u1",
          totalAmount: 250,
          status: "Pending",
          fullName: "John",
          phone: "9800",
          address: "Kathmandu",
          note: "leave at gate",
          items: expect.any(Array),
        })
      );

      // ensure pizzaId converted to ObjectId
      const arg = createSpy.mock.calls[0][0];
      expect(arg.items[0].pizzaId).toBeInstanceOf(mongoose.Types.ObjectId);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeOrder });
    });

    it("returns 500 on exception", async () => {
      (OrderModel.create as jest.Mock).mockRejectedValue(new Error("DB down"));

      const req: any = {
        user: { _id: "u1" },
        body: {
          items: [{ pizzaId: "000000000000000000000001", price: 10, quantity: 1 }],
          fullName: "A",
          phone: "9",
          address: "X",
        },
      };
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("getMyOrders", () => {
    it("returns 401 if req.user missing", async () => {
      const req: any = {};
      const res = mockRes();

      await controller.getMyOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 200 with orders array", async () => {
      const sortMock = jest.fn().mockResolvedValue([{ _id: "o1" }]);
      (OrderModel.find as jest.Mock).mockReturnValue({ sort: sortMock });

      const req: any = { user: { _id: "u1" } };
      const res = mockRes();

      await controller.getMyOrders(req, res);

      expect(OrderModel.find).toHaveBeenCalledWith({ userId: "u1" });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ _id: "o1" }],
      });
    });
  });

  describe("cancel", () => {
    it("returns 401 if req.user missing", async () => {
      const req: any = { params: { id: "o1" } };
      const res = mockRes();

      await controller.cancel(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 404 if order not found", async () => {
      (OrderModel.findOne as jest.Mock).mockResolvedValue(null);

      const req: any = { user: { _id: "u1" }, params: { id: "o1" } };
      const res = mockRes();

      await controller.cancel(req, res);

      expect(OrderModel.findOne).toHaveBeenCalledWith({ _id: "o1", userId: "u1" });
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 if order is not Pending", async () => {
      (OrderModel.findOne as jest.Mock).mockResolvedValue({
        status: "Accepted",
        save: jest.fn(),
      });

      const req: any = { user: { _id: "u1" }, params: { id: "o1" } };
      const res = mockRes();

      await controller.cancel(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You can cancel only before the order is accepted.",
        })
      );
    });

    it("sets status Cancelled and returns 200", async () => {
      const save = jest.fn();
      const orderDoc: any = { status: "Pending", save };

      (OrderModel.findOne as jest.Mock).mockResolvedValue(orderDoc);

      const req: any = { user: { _id: "u1" }, params: { id: "o1" } };
      const res = mockRes();

      await controller.cancel(req, res);

      expect(orderDoc.status).toBe("Cancelled");
      expect(save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: orderDoc });
    });
  });

  describe("getAll (admin)", () => {
    it("returns 200 with all orders", async () => {
      const sortMock = jest.fn().mockResolvedValue([{ _id: "o1" }, { _id: "o2" }]);
      (OrderModel.find as jest.Mock).mockReturnValue({ sort: sortMock });

      const req: any = {};
      const res = mockRes();

      await controller.getAll(req, res);

      expect(OrderModel.find).toHaveBeenCalled();
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ _id: "o1" }, { _id: "o2" }],
      });
    });
  });

  describe("updateStatus (admin)", () => {
    it("returns 400 for invalid status", async () => {
      const req: any = { params: { id: "o1" }, body: { status: "WRONG" } };
      const res = mockRes();

      await controller.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Invalid status" })
      );
    });

    it("returns 404 if order not found", async () => {
      (OrderModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const req: any = { params: { id: "o1" }, body: { status: "Accepted" } };
      const res = mockRes();

      await controller.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("updates status and returns 200", async () => {
      (OrderModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: "o1",
        status: "Accepted",
      });

      const req: any = { params: { id: "o1" }, body: { status: "Accepted" } };
      const res = mockRes();

      await controller.updateStatus(req, res);

      expect(OrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "o1",
        { status: "Accepted" },
        { new: true }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { _id: "o1", status: "Accepted" },
      });
    });
  });
});