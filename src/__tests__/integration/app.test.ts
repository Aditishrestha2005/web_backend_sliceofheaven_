import request from "supertest";
import app from "../../app";

describe("Root API", () => {

  it("GET / should return welcome message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Welcome to the API",
    });
  });

  it("GET unknown route should return 404", async () => {
    const res = await request(app).get("/unknown-route");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Route not found");
  });

  it("POST unknown route should return 404", async () => {
    const res = await request(app).post("/invalid");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("DELETE unknown route should return 404", async () => {
    const res = await request(app).delete("/nothing");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

});