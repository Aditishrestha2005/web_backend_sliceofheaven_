import z from "zod";
import { UserSchema } from "../types/user.type";


/**
 * CREATE USER DTO
 * Used for Register API
 * confirmPassword is NOT handled in backend
 */
export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

/**
 * LOGIN USER DTO
 * Used for Login API
 */
export const LoginUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;