import z from "zod";

export const UserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),

  fullName: z.string().min(1),      // ✅
  phoneNumber: z.string().min(7),   // ✅

  role: z.enum(["user", "admin"]).default("user"),
  imageUrl: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
