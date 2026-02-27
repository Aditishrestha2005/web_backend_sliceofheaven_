// import { UserService } from "../services/user.service";
// import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dtos";
// import { Request, Response } from "express";
// import z from "zod";

// const userService = new UserService();

// export class UserController {
//   // Register user
//   async register(req: Request, res: Response) {
//     try {
//       // ✅ BACKEND COMPATIBILITY FIX (Normalize incoming keys)
//       req.body.fullName =
//         req.body.fullName ??
//         req.body.fullname ??
//         req.body.full_name ??
//         req.body.name;

//       req.body.phoneNumber =
//         req.body.phoneNumber ??
//         req.body.phone ??
//         req.body.phone_number;

//       req.body.confirmPassword =
//         req.body.confirmPassword ??
//         req.body.confirm_password;

//       // (Optional) Debug - remove after testing
//       // console.log("REGISTER BODY:", req.body);

//       const parsedData = CreateUserDTO.safeParse(req.body);

//       if (!parsedData.success) {
//         return res.status(400).json({
//           success: false,
//           message: z.prettifyError(parsedData.error),
//           errors: parsedData.error.flatten(),
//         });
//       }

//       const newUser = await userService.createUser(parsedData.data);

//       return res.status(201).json({
//         success: true,
//         message: "User Created",
//         data: newUser,
//       });
//     } catch (error: any) {
//       return res.status(error.statusCode ?? 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // Login user
//   async login(req: Request, res: Response) {
//     try {
//       const parsedData = LoginUserDTO.safeParse(req.body);

//       if (!parsedData.success) {
//         return res.status(400).json({
//           success: false,
//           message: z.prettifyError(parsedData.error),
//           errors: parsedData.error.flatten(),
//         });
//       }

//       const { token, user } = await userService.loginUser(parsedData.data);

//       return res.status(200).json({
//         success: true,
//         message: "Login successful",
//         data: user,
//         token,
//       });
//     } catch (error: any) {
//       return res.status(error.statusCode ?? 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // Get user profile
//   async getProfile(req: Request, res: Response) {
//     try {
//       const userId = req.user?._id;

//       if (!userId) {
//         return res.status(401).json({
//           success: false,
//           message: "Unauthorized",
//         });
//       }

//       const user = await userService.getUserById(userId);

//       return res.status(200).json({
//         success: true,
//         message: "User profile fetched successfully",
//         data: user,
//       });
//     } catch (error: any) {
//       return res.status(error.statusCode ?? 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // Update user profile
//   async updateProfile(req: Request, res: Response) {
//     try {
//       const userId = req.user?._id;
//       if (!userId) {
//         return res.status(401).json({
//           success: false,
//           message: "Unauthorized",
//         });
//       }

//       const parsedData = UpdateUserDTO.safeParse(req.body);
//       if (!parsedData.success) {
//         return res.status(400).json({
//           success: false,
//           message: z.prettifyError(parsedData.error),
//           errors: parsedData.error.flatten(),
//         });
//       }

//       // ✅ Handle profile image upload
//       if (req.file) {
//         parsedData.data.imageUrl = `/uploads/profilepicture/${req.file.filename}`;
//       }

//       const updatedUser = await userService.updateUser(userId, parsedData.data);

//       return res.status(200).json({
//         success: true,
//         message: "User profile updated successfully",
//         data: updatedUser,
//       });
//     } catch (error: any) {
//       return res.status(error.statusCode ?? 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }
// // ✅ Send reset link (safe + robust)
// async sendResetPasswordEmail(req: Request, res: Response) {
//   try {
//     const email = String(req.body?.email || "")
//       .trim()
//       .toLowerCase();

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     // ✅ SECURITY: do NOT reveal whether user exists
//     try {
//       await userService.sendResetPasswordEmail(email);
//     } catch (err: any) {
//       // If your service throws "User not found", ignore it and respond success anyway
//       // so attackers can't check which emails exist.
//       if (String(err?.message || "").toLowerCase().includes("user not found")) {
//         // swallow
//       } else {
//         throw err; // real errors should still bubble up
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "If the email is registered, a reset link has been sent.",
//     });
//   } catch (error: any) {
//     return res.status(error.statusCode ?? 500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// }

// // ✅ Reset password using token
// async resetPassword(req: Request, res: Response) {
//   try {
//     const token = String(req.params?.token || "").trim();
//     const newPassword = String(req.body?.newPassword || "").trim();

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: "Token is required",
//       });
//     }

//     if (!newPassword || newPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "New password must be at least 6 characters",
//       });
//     }

//     await userService.resetPassword(token, newPassword);

//     return res.status(200).json({
//       success: true,
//       message: "Password has been reset successfully.",
//     });
//   } catch (error: any) {
//     return res.status(error.statusCode ?? 500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// }

// }

import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dtos";
import { Request, Response } from "express";
import z from "zod";

const userService = new UserService();

export class UserController {
  // Register user
  async register(req: Request, res: Response) {
    try {
      req.body.fullName =
        req.body.fullName ??
        req.body.fullname ??
        req.body.full_name ??
        req.body.name;

      req.body.phoneNumber =
        req.body.phoneNumber ??
        req.body.phone ??
        req.body.phone_number;

      req.body.confirmPassword =
        req.body.confirmPassword ??
        req.body.confirm_password;

      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
          errors: parsedData.error.flatten(),
        });
      }

      const newUser = await userService.createUser(parsedData.data);

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      // normalize email for login too
      if (req.body?.email) req.body.email = String(req.body.email).trim().toLowerCase();

      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
          errors: parsedData.error.flatten(),
        });
      }

      const { token, user } = await userService.loginUser(parsedData.data);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: user,
        token,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Get user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await userService.getUserById(userId);

      return res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const parsedData = UpdateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
          errors: parsedData.error.flatten(),
        });
      }

      if ((req as any).file) {
        parsedData.data.imageUrl = `/uploads/profilepicture/${(req as any).file.filename}`;
      }

      const updatedUser = await userService.updateUser(userId, parsedData.data);

      return res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async sendResetPasswordEmail(req: Request, res: Response) {
        try {
            const email = req.body.email;
            const user = await userService.sendResetPasswordEmail(email);
            return res.status(200).json(
                { success: true,
                    data: user,
                    message: "If the email is registered, a reset link has been sent." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {

           const token = req.params.token;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}
