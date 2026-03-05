import request from "supertest";
import app from "../../app";
import { v4 as uuid } from "uuid";

function makeUser() {
  const id = uuid().slice(0, 8);
  const email = `test_${id}@example.com`;
  const username = `testuser_${id}`;
  const password = "Password123!";
  return {
    fullName: "Test User",
    phoneNumber: "9800000000",
    email,
    username,
    password,
    confirmPassword: password,
  };
}

async function registerUser(u: ReturnType<typeof makeUser>) {
  // register uses uploads.none() => multipart/form-data is correct
  return request(app)
    .post("/api/auth/register")
    .field("fullName", u.fullName)
    .field("phoneNumber", u.phoneNumber)
    .field("email", u.email)
    .field("username", u.username)
    .field("password", u.password)
    .field("confirmPassword", u.confirmPassword);
}

async function loginUser(email: string, password: string) {
  return request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send({ email, password });
}

async function registerAndLogin() {
  const u = makeUser();

  const reg = await registerUser(u);
  // If this fails, we want to see why immediately
  if (reg.status !== 201) {
    // helpful debugging in test output
    // eslint-disable-next-line no-console
    console.log("REGISTER FAIL:", reg.status, reg.body);
  }
  expect(reg.status).toBe(201);
  expect(reg.body.success).toBe(true);
  expect(reg.body.message).toBe("User Created");

  const login = await loginUser(u.email, u.password);
  if (login.status !== 200) {
    // eslint-disable-next-line no-console
    console.log("LOGIN FAIL:", login.status, login.body);
  }
  expect(login.status).toBe(200);
  expect(login.body.success).toBe(true);
  expect(login.body.message).toBe("Login successful");
  expect(typeof login.body.token).toBe("string");
  expect(login.body.token.length).toBeGreaterThan(10);

  return { u, token: login.body.token as string };
}

describe("Auth integration", () => {
  it("POST /api/auth/register should create user (201)", async () => {
    const u = makeUser();
    const res = await registerUser(u);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User Created");
    expect(res.body.data).toBeTruthy();
  });

  it("POST /api/auth/register should fail when passwords mismatch (400)", async () => {
    const u = makeUser();
    u.confirmPassword = "Different123!";

    const res = await request(app)
      .post("/api/auth/register")
      .field("fullName", u.fullName)
      .field("phoneNumber", u.phoneNumber)
      .field("email", u.email)
      .field("username", u.username)
      .field("password", u.password)
      .field("confirmPassword", u.confirmPassword);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeTruthy();
    expect(res.body.errors).toBeTruthy();
  });

  it("POST /api/auth/login should fail on invalid body (400)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send({ email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeTruthy();
  });

  it("POST /api/auth/login should succeed after register (200 + token)", async () => {
    const { token } = await registerAndLogin();
    expect(token.length).toBeGreaterThan(10);
  });

  it("GET /api/auth/whoami should return 401 without token", async () => {
    const res = await request(app).get("/api/auth/whoami");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(String(res.body.message)).toContain("Unauthorized");
  });

  it("GET /api/auth/whoami should return 200 with Bearer token", async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User profile fetched successfully");
    expect(res.body.data).toBeTruthy();
  });

  it("POST /api/auth/update-profile should return 401 without token", async () => {
    const res = await request(app)
      .post("/api/auth/update-profile")
      .field("fullName", "Updated Name");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(String(res.body.message)).toContain("Unauthorized");
  });

  it("POST /api/auth/update-profile should return 200 with Bearer token", async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .post("/api/auth/update-profile")
      .set("Authorization", `Bearer ${token}`)
      .field("fullName", "Updated Name");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User profile updated successfully");
    expect(res.body.data).toBeTruthy();
  });

  it("POST /api/auth/request-password-reset should return 200 always", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .set("Content-Type", "application/json")
      .send({ email: "someone@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(
      "If the email is registered, a reset link has been sent."
    );
  });

  it("POST /api/auth/reset-password/:token should NOT be 404 (route exists)", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password/fake-token")
      .set("Content-Type", "application/json")
      .send({ newPassword: "NewPassword123!" });

    expect(res.status).not.toBe(404);
  });
});