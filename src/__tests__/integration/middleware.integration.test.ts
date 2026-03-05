// src/__tests__/integration/middleware.integration.test.ts
import request from "supertest";
import app from "../../app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

function signToken(payload: Record<string, any>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

describe("Middleware integration (auth + admin)", () => {
  // ✅ AUTH MIDDLEWARE (whoami route protected)
  it("GET /api/auth/whoami should return 401 if Authorization header missing", async () => {
    const res = await request(app).get("/api/auth/whoami");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/whoami should return 401 if Authorization is not Bearer", async () => {
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", "Token abc");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/whoami should return 401 if Bearer token missing", async () => {
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", "Bearer ");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/whoami should return 500 for invalid token (current middleware behavior)", async () => {
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/whoami should return 401 if token payload has no id", async () => {
    const token = signToken({ email: "x@x.com" });

    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/whoami should return 401 if user not found in DB", async () => {
    const token = signToken({ id: "000000000000000000000000" });

    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ✅ ADMIN ROUTE (authorizedMiddleware + adminMiddleware)
  it("GET /api/admin/orders should return 401 with missing token", async () => {
    const res = await request(app).get("/api/admin/orders");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/admin/orders should return 500 with invalid token (current middleware behavior)", async () => {
    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/admin/orders should return 401 if token payload has no id", async () => {
    const token = signToken({ email: "no-id@x.com" });

    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/admin/orders should return 401 if user not found in DB", async () => {
    const token = signToken({ id: "000000000000000000000000" });

    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});