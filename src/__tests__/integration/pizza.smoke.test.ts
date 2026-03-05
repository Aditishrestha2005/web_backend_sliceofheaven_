import request from "supertest";
import app from "../../app";

describe("Pizza routes (smoke)", () => {
  it("GET /api/pizzas should exist (not 404)", async () => {
    const res = await request(app).get("/api/pizzas");
    expect(res.status).not.toBe(404);
  });

  it("POST /api/pizzas should exist (not 404)", async () => {
    // uses multer single("image") so send multipart even if empty
    const res = await request(app)
      .post("/api/pizzas")
      .field("name", "Test Pizza")
      .field("price", "199");

    expect(res.status).not.toBe(404);
  });

  it("DELETE /api/pizzas/:id should exist (not 404)", async () => {
    const res = await request(app).delete("/api/pizzas/invalid-id");
    expect(res.status).not.toBe(404);
  });
});