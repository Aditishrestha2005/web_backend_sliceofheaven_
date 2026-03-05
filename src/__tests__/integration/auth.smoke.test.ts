import request from "supertest";
import app from "../../app";

describe("Auth routes (smoke)", () => {
  it("POST /api/auth/register should exist (not 404)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .field("fullName", "Test User")
      .field("email", "testuser@example.com")
      .field("password", "Password123!");

    expect(res.status).not.toBe(404);
  });

  it("POST /api/auth/login should exist (not 404) with JSON OR multipart", async () => {
    // Try JSON first
    const jsonRes = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send({ email: "testuser@example.com", password: "Password123!" });

    if (jsonRes.status !== 404) {
      expect(jsonRes.status).not.toBe(404);
      return;
    }

    // If JSON returned 404, try multipart/form-data (some backends handle login like register)
    const multipartRes = await request(app)
      .post("/api/auth/login")
      .field("email", "testuser@example.com")
      .field("password", "Password123!");

    expect(multipartRes.status).not.toBe(404);
  });

  it("GET /api/auth/whoami should exist (not 404) even without token", async () => {
    const res = await request(app).get("/api/auth/whoami");
    expect(res.status).not.toBe(404);
  });

  it("POST /api/auth/update-profile should exist (not 404) even without token", async () => {
    const res = await request(app)
      .post("/api/auth/update-profile")
      .field("fullName", "Updated Name");

    expect(res.status).not.toBe(404);
  });

  it("POST /api/auth/request-password-reset should exist (not 404)", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .set("Content-Type", "application/json")
      .send({ email: "testuser@example.com" });

    expect(res.status).not.toBe(404);
  });

  it("POST /api/auth/reset-password/:token should exist (not 404)", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password/fake-token")
      .set("Content-Type", "application/json")
      .send({ password: "NewPassword123!" });

    expect(res.status).not.toBe(404);
  });
});