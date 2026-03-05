import request from "supertest";
import app from "../../app";
import { v4 as uuid } from "uuid";

function makeUser() {
  const id = uuid().slice(0, 8);
  return {
    fullName: "Order Test User",
    phoneNumber: "9800000000",
    email: `order_${id}@example.com`,
    username: `orderuser_${id}`,
    password: "Password123!",
    confirmPassword: "Password123!",
  };
}

async function registerAndLogin() {
  const user = makeUser();

  const reg = await request(app)
    .post("/api/auth/register")
    .field("fullName", user.fullName)
    .field("phoneNumber", user.phoneNumber)
    .field("email", user.email)
    .field("username", user.username)
    .field("password", user.password)
    .field("confirmPassword", user.confirmPassword);

  expect(reg.status).toBe(201);

  const login = await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send({ email: user.email, password: user.password });

  expect(login.status).toBe(200);
  return login.body.token as string;
}

function validOrderBody() {
  return {
    items: [
      {
        pizzaId: "000000000000000000000000", // valid ObjectId format
        name: "Test Pizza",
        price: 200,
        image: "/uploads/pizzas/x.jpg",
        quantity: 2,
      },
    ],
    fullName: "Delivery Name",
    phone: "9800000000",
    address: "Kathmandu",
    note: "Leave at door",
  };
}

describe("Order integration", () => {
  it("POST /api/orders should return 401 without token", async () => {
    const res = await request(app).post("/api/orders").send(validOrderBody());
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/orders/my should return 401 without token", async () => {
    const res = await request(app).get("/api/orders/my");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/orders should return 400 if items missing", async () => {
    const token = await registerAndLogin();

    const body = { ...validOrderBody(), items: [] };

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Cart items required");
  });

  it("POST /api/orders should return 400 if delivery details missing", async () => {
    const token = await registerAndLogin();

    const body: any = validOrderBody();
    delete body.address;

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Delivery details required");
  });

  it("POST /api/orders should create order (201) and totalAmount correct", async () => {
    const token = await registerAndLogin();

    const body = validOrderBody(); // price 200, qty 2 => 400

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.status).toBe("Pending");
    expect(res.body.data.totalAmount).toBe(400);
  });

  it("GET /api/orders/my should return array (200)", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PATCH /api/orders/:id/cancel should return 404 if order not found", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .patch("/api/orders/000000000000000000000000/cancel")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Order not found");
  });

  it("PATCH /api/orders/:id/cancel should cancel pending order (200)", async () => {
    const token = await registerAndLogin();

    // create order
    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(validOrderBody());

    expect(created.status).toBe(201);
    const id = created.body.data._id;

    // cancel
    const res = await request(app)
      .patch(`/api/orders/${id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("Cancelled");
  });

  it("PATCH /api/orders/:id/cancel should fail if order not pending (400)", async () => {
    const token = await registerAndLogin();

    // create order
    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(validOrderBody());

    expect(created.status).toBe(201);
    const id = created.body.data._id;

    // cancel once -> becomes Cancelled
    const first = await request(app)
      .patch(`/api/orders/${id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(first.status).toBe(200);

    // cancel again -> should fail (not Pending)
    const second = await request(app)
      .patch(`/api/orders/${id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(second.status).toBe(400);
    expect(second.body.success).toBe(false);
    expect(second.body.message).toBe(
      "You can cancel only before the order is accepted."
    );
  });
});