import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../config/email";
import { HttpError } from "../../error/http-error";

// ✅ shared repo mock (the SAME instance used by user.service.ts)
const repoMock = {
  getUserByEmail: jest.fn(),
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
};

// ✅ IMPORTANT: mock repository BEFORE importing UserService
jest.mock("../../repositories/user.repository", () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => repoMock),
  };
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("../../config/email", () => ({
  sendEmail: jest.fn(),
}));

// ✅ Now import service AFTER mocks
import { UserService } from "../../services/user.service";

describe("UserService (unit)", () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  describe("createUser", () => {
    it("throws 403 if email already in use", async () => {
      repoMock.getUserByEmail.mockResolvedValue({ _id: "1" });

      await expect(
        service.createUser({
          fullName: "A",
          phoneNumber: "9",
          email: "a@a.com",
          username: "a",
          password: "secret12",
          confirmPassword: "secret12",
        } as any)
      ).rejects.toMatchObject({ statusCode: 403 });

      await expect(
        service.createUser({
          fullName: "A",
          phoneNumber: "9",
          email: "a@a.com",
          username: "a",
          password: "secret12",
          confirmPassword: "secret12",
        } as any)
      ).rejects.toEqual(expect.any(HttpError));
    });

    it("throws 403 if username already in use", async () => {
      repoMock.getUserByEmail.mockResolvedValue(null);
      repoMock.getUserByUsername.mockResolvedValue({ _id: "1" });

      await expect(
        service.createUser({
          fullName: "A",
          phoneNumber: "9",
          email: "a@a.com",
          username: "a",
          password: "secret12",
          confirmPassword: "secret12",
        } as any)
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("hashes password and does NOT save confirmPassword", async () => {
      repoMock.getUserByEmail.mockResolvedValue(null);
      repoMock.getUserByUsername.mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue("HASHED");
      repoMock.createUser.mockResolvedValue({ _id: "newUserId" });

      const res = await service.createUser({
        fullName: "A",
        phoneNumber: "9",
        email: "a@a.com",
        username: "a",
        password: "secret12",
        confirmPassword: "secret12",
      } as any);

      expect(bcryptjs.hash).toHaveBeenCalledWith("secret12", 10);

      expect(repoMock.createUser).toHaveBeenCalledTimes(1);
      const arg = repoMock.createUser.mock.calls[0][0];

      expect(arg).toEqual(
        expect.objectContaining({
          fullName: "A",
          phoneNumber: "9",
          email: "a@a.com",
          username: "a",
          password: "HASHED",
        })
      );
      expect(arg.confirmPassword).toBeUndefined();

      expect(res).toEqual({ _id: "newUserId" });
    });
  });

  describe("loginUser", () => {
    it("throws 404 if user not found", async () => {
      repoMock.getUserByEmail.mockResolvedValue(null);

      await expect(
        service.loginUser({ email: "x@x.com", password: "secret12" } as any)
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 401 if password invalid", async () => {
      repoMock.getUserByEmail.mockResolvedValue({
        _id: "1",
        email: "x@x.com",
        username: "x",
        password: "HASHED",
        role: "user",
        fullName: "Full",
        phoneNumber: "98",
        toObject() {
          return { ...this };
        },
      });

      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.loginUser({ email: "x@x.com", password: "wrong" } as any)
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("returns token and user without password", async () => {
      const userDoc = {
        _id: "1",
        email: "x@x.com",
        username: "x",
        password: "HASHED",
        role: "user",
        fullName: "Full",
        phoneNumber: "98",
        toObject() {
          return {
            _id: "1",
            email: "x@x.com",
            username: "x",
            password: "HASHED",
            role: "user",
            fullName: "Full",
            phoneNumber: "98",
          };
        },
      };

      repoMock.getUserByEmail.mockResolvedValue(userDoc);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("TOKEN");

      const res = await service.loginUser({
        email: "x@x.com",
        password: "secret12",
      } as any);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          email: "x@x.com",
          username: "x",
          fullName: "Full",
          phoneNumber: "98",
          role: "user",
        }),
        expect.anything(),
        { expiresIn: "30d" }
      );

      expect(res.token).toBe("TOKEN");
      expect(res.user.password).toBeUndefined();
      expect(res.user.email).toBe("x@x.com");
    });
  });

  describe("getUserById", () => {
    it("throws 400 if userId missing", async () => {
      await expect(service.getUserById("" as any)).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("throws 404 if user not found", async () => {
      repoMock.getUserById.mockResolvedValue(null);

      await expect(service.getUserById("123")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("returns user if found", async () => {
      repoMock.getUserById.mockResolvedValue({ _id: "123" });

      const res = await service.getUserById("123");
      expect(res).toEqual({ _id: "123" });
    });
  });

  describe("updateUser", () => {
    it("throws 404 if user not found", async () => {
      repoMock.getUserById.mockResolvedValue(null);

      await expect(service.updateUser("1", {} as any)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("throws 409 if email already exists", async () => {
      repoMock.getUserById.mockResolvedValue({
        _id: "1",
        email: "old@x.com",
        username: "u",
      });

      repoMock.getUserByEmail.mockResolvedValue({ _id: "2" });

      await expect(
        service.updateUser("1", { email: "new@x.com" } as any)
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("throws 409 if username already exists", async () => {
      repoMock.getUserById.mockResolvedValue({
        _id: "1",
        email: "a@a.com",
        username: "old",
      });

      repoMock.getUserByUsername.mockResolvedValue({ _id: "2" });

      await expect(
        service.updateUser("1", { username: "new" } as any)
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("hashes password if provided", async () => {
      repoMock.getUserById.mockResolvedValue({
        _id: "1",
        email: "a@a.com",
        username: "u",
      });

      repoMock.getUserByEmail.mockResolvedValue(null);
      repoMock.getUserByUsername.mockResolvedValue(null);

      (bcryptjs.hash as jest.Mock).mockResolvedValue("HASHED_NEW");
      repoMock.updateUser.mockResolvedValue({ _id: "1" });

      await service.updateUser("1", { password: "newpass12" } as any);

      expect(bcryptjs.hash).toHaveBeenCalledWith("newpass12", 10);
      expect(repoMock.updateUser).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ password: "HASHED_NEW" })
      );
    });

    it("updates user normally", async () => {
      repoMock.getUserById.mockResolvedValue({
        _id: "1",
        email: "a@a.com",
        username: "u",
      });

      repoMock.getUserByEmail.mockResolvedValue(null);
      repoMock.getUserByUsername.mockResolvedValue(null);

      repoMock.updateUser.mockResolvedValue({ _id: "1", fullName: "X" });

      const res = await service.updateUser("1", { fullName: "X" } as any);

      expect(repoMock.updateUser).toHaveBeenCalledWith("1", { fullName: "X" });
      expect(res).toEqual({ _id: "1", fullName: "X" });
    });
  });

  describe("sendResetPasswordEmail", () => {
    it("throws 400 if email missing", async () => {
      await expect(service.sendResetPasswordEmail(undefined)).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("returns true if user not found (security)", async () => {
      repoMock.getUserByEmail.mockResolvedValue(null);

      const res = await service.sendResetPasswordEmail("no@user.com");
      expect(res).toBe(true);
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("sends email when user exists", async () => {
      repoMock.getUserByEmail.mockResolvedValue({ _id: "1", email: "x@x.com" });
      (jwt.sign as jest.Mock).mockReturnValue("RESET_TOKEN");

      const res = await service.sendResetPasswordEmail("X@X.com");

      expect(res).toBe(true);

      // email is normalized to lowercase
      expect(repoMock.getUserByEmail).toHaveBeenCalledWith("x@x.com");

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "1" },
        expect.anything(),
        { expiresIn: "1h" }
      );

      expect(sendEmail).toHaveBeenCalledWith(
        "x@x.com",
        "Password Reset",
        expect.stringContaining("RESET_TOKEN")
      );
    });
  });

  describe("resetPassword", () => {
    it("throws 400 if token or newPassword missing", async () => {
      await expect(service.resetPassword(undefined, "x")).rejects.toMatchObject({
        statusCode: 400,
      });

      await expect(service.resetPassword("t", undefined)).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("throws 400 if password too short", async () => {
      await expect(service.resetPassword("t", "123")).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("throws 400 if token invalid/expired", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("bad");
      });

      await expect(service.resetPassword("bad", "123456")).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("throws 400 if token payload missing id", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({});

      await expect(service.resetPassword("t", "123456")).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("hashes password and updates user", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "1" });
      (bcryptjs.hash as jest.Mock).mockResolvedValue("HASHED");
      repoMock.updateUser.mockResolvedValue({ _id: "1" });

      const res = await service.resetPassword("t", "123456");

      expect(res).toBe(true);
      expect(repoMock.updateUser).toHaveBeenCalledWith("1", { password: "HASHED" });
    });

    it("throws 404 if updateUser returns null", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "1" });
      (bcryptjs.hash as jest.Mock).mockResolvedValue("HASHED");
      repoMock.updateUser.mockResolvedValue(null);

      await expect(service.resetPassword("t", "123456")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});