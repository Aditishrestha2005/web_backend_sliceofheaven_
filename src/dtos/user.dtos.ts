import z from "zod";
import { UserSchema } from "../types/user.type";

/**
 * CREATE USER DTO
 * Used for Register API
 * Now uses fullName & phoneNumber instead of firstName/lastName
 */
export const CreateUserDTO = UserSchema.pick({
  fullName: true,       // ✅ CHANGED
  phoneNumber: true,    // ✅ CHANGED
  email: true,
  username: true,
  password: true,
  imageUrl: true,
}).extend({
  confirmPassword: z.string().min(6),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

/**
 * LOGIN USER DTO
 * (unchanged)
 */
export const LoginUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

/**
 * UPDATE USER DTO
 * Allows updating any user field (fullName, phoneNumber, etc.)
 */
export const UpdateUserDTO = UserSchema.partial();
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
