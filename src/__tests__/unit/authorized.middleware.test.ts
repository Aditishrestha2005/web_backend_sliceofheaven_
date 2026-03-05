import jwt from "jsonwebtoken";

// ✅ Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

/**
 * ✅ IMPORTANT FIX:
 * jest.mock is hoisted, so we cannot reference repoMock declared later.
 * We create the mock inside the factory and also expose it via globalThis.
 */
jest.mock("../../repositories/user.repository", () => {
  const repoMock = {
    getUserById: jest.fn(),
  };

  (globalThis as any).__repoMock = repoMock;

  return {
    UserRepository: jest.fn().mockImplementation(() => repoMock),
  };
});

// ✅ Import middleware AFTER mocks
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../../middlewares/authorized.middleware";

// helper to access the same repo instance used by middleware
function repo() {
  return (globalThis as any).__repoMock as {
    getUserById: jest.Mock;
  };
}

// ---- helpers
function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockNext() {
  return jest.fn();
}

describe("authorized.middleware (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if Authorization header missing", async () => {
    const req: any = { headers: {} };
    const res = mockRes();
    const next = mockNext();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 if Authorization does not start with Bearer", async () => {
    const req: any = { headers: { authorization: "Token abc" } };
    const res = mockRes();
    const next = mockNext();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 if Bearer token missing after Bearer", async () => {
    const req: any = { headers: { authorization: "Bearer " } };
    const res = mockRes();
    const next = mockNext();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 if jwt.verify returns payload without id", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({}); // no id

    const req: any = { headers: { authorization: "Bearer validtoken" } };
    const res = mockRes();
    const next = mockNext();

    await authorizedMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 if user not found in DB", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "123" });
    repo().getUserById.mockResolvedValue(null);

    const req: any = { headers: { authorization: "Bearer validtoken" } };
    const res = mockRes();
    const next = mockNext();

    await authorizedMiddleware(req, res, next);

    expect(repo().getUserById).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches req.user and calls next when valid token + user exists", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "123" });
    const userDoc = { _id: "123", email: "x@x.com", role: "user" };
    repo().getUserById.mockResolvedValue(userDoc);

    const req: any = { headers: { authorization: "Bearer validtoken" } };
    const res = mockRes();
    const next = mockNext();

    await authorizedMiddleware(req, res, next);

    expect(req.user).toEqual(userDoc);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 500 if jwt.verify throws unexpected error", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("boom");
    });

    const req: any = { headers: { authorization: "Bearer validtoken" } };
    const res = mockRes();
    const next = mockNext();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("adminMiddleware (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if req.user missing", async () => {
    const req: any = {};
    const res = mockRes();
    const next = mockNext();

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 if user is not admin", async () => {
    const req: any = { user: { role: "user" } };
    const res = mockRes();
    const next = mockNext();

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next if user is admin", async () => {
    const req: any = { user: { role: "admin" } };
    const res = mockRes();
    const next = mockNext();

    await adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});