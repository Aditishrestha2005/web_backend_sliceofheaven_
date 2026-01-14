import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dtos";
import { Request, Response } from "express";

const userService = new UserService();

export class UserController {

    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
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

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
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
}
