import request from "supertest";
import app from "../../app";
import { v4 as uuid } from "uuid";

function makeUser(role: "user" | "admin" = "user") {
  const id = uuid().slice(0, 8);

  return {
    fullName: "Admin Order Test",
    phoneNumber: "9800000000",
    email: `${role}_${id}@example.com`,
    username: `${role}_${id}`,
    password: "Password123!",
    confirmPassword: "Password123!",
    role,
  };
}

async function registerAndLogin(role: "user" | "admin" = "user") {
  const user = makeUser(role);

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
    .send({
      email: user.email,
      password: user.password,
    });

  expect(login.status).toBe(200);

  return login.body.token;
}

describe("Admin Order integration", () => {

  it("GET /api/admin/orders should return 401 without token", async () => {
    const res = await request(app).get("/api/admin/orders");

    expect(res.status).toBe(401);
  });

  it("GET /api/admin/orders should return 403 for normal user", async () => {
    const token = await registerAndLogin("user");

    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("GET /api/admin/orders should exist for admin", async () => {
    const token = await registerAndLogin("admin");

    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).not.toBe(404);
  });

  it("PATCH /api/admin/orders/:id/status should exist for admin", async () => {
    const token = await registerAndLogin("admin");

    const res = await request(app)
      .patch("/api/admin/orders/000000000000000000000000/status")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "Delivered",
      });

    expect(res.status).not.toBe(404);
  });

});