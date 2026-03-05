import request from "supertest";
import app from "../../app";
import { v4 as uuid } from "uuid";

function makeUser(role: "user" | "admin" = "admin") {
  const id = uuid().slice(0, 8);

  return {
    fullName: "Admin User Test",
    phoneNumber: "9800000000",
    email: `${role}_${id}@example.com`,
    username: `${role}_${id}`,
    password: "Password123!",
    confirmPassword: "Password123!",
  };
}

async function registerAndLoginAdmin() {
  const user = makeUser("admin");

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

describe("Admin User integration", () => {

  it("GET /api/admin/users should return 401 without token", async () => {
    const res = await request(app).get("/api/admin/users");

    expect(res.status).toBe(401);
  });

  it("GET /api/admin/users should exist for admin", async () => {
    const token = await registerAndLoginAdmin();

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).not.toBe(404);
  });

  it("POST /api/admin/users should exist for admin", async () => {
    const token = await registerAndLoginAdmin();

    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .field("fullName", "New Admin User")
      .field("phoneNumber", "9800000000")
      .field("email", `new_${uuid()}@example.com`)
      .field("username", `new_${uuid()}`)
      .field("password", "Password123!");

    expect(res.status).not.toBe(404);
  });

  it("GET /api/admin/users/:id should exist", async () => {
    const token = await registerAndLoginAdmin();

    const res = await request(app)
      .get("/api/admin/users/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).not.toBe(404);
  });

  it("DELETE /api/admin/users/:id should exist", async () => {
    const token = await registerAndLoginAdmin();

    const res = await request(app)
      .delete("/api/admin/users/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).not.toBe(404);
  });

});