// import { UserModel, IUser } from "../models/user.model";
// export interface IUserRepository {
//     getUserByEmail(email: string): Promise<IUser | null>;
//     getUserByUsername(username: string): Promise<IUser | null>;
//     // Additional
//     // 5 common database queries for entity
//     createUser(userData: Partial<IUser>): Promise<IUser>;
//     getUserById(id: string): Promise<IUser | null>;
//     getAllUsers(): Promise<IUser[]>;
//     updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
//     deleteUser(id: string): Promise<boolean>;
// }
// // MongoDb Implementation of UserRepository
// export class UserRepository implements IUserRepository {
//     async createUser(userData: Partial<IUser>): Promise<IUser> {
//         const user = new UserModel(userData); 
//         return await user.save();
//     }
//     async getUserByEmail(email: string): Promise<IUser | null> {
//         const user = await UserModel.findOne({ "email": email })
//         return user;
//     }
//     async getUserByUsername(username: string): Promise<IUser | null> {
//         const user = await UserModel.findOne({ "username": username })
//         return user;
//     }

//     async getUserById(id: string): Promise<IUser | null> {
//         // UserModel.findOne({ "_id": id });
//         const user = await UserModel.findById(id);
//         return user;
//     }
//     async getAllUsers(): Promise<IUser[]> {
//         const users = await UserModel.find();
//         return users;
//     }
//     async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
//         // UserModel.updateOne({ _id: id }, { $set: updateData });
//         const updatedUser = await UserModel.findByIdAndUpdate(
//             id, updateData, { new: true } // return the updated document
//         );
//         return updatedUser;
//     }
//     async deleteUser(id: string): Promise<boolean> {
//         // UserModel.deleteOne({ _id: id });
//         const result = await UserModel.findByIdAndDelete(id);
//         return result ? true : false;
//     }
// }

import { QueryFilter } from "mongoose";
import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;

  createUser(userData: Partial<IUser>): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;

  // ✅ Pagination like teacher
  getAllUsers(
    page: number,
    size: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }>;

  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async getAllUsers(
    page: number,
    size: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    const filter: QueryFilter<IUser> = {};

    if (search && search.trim()) {
      const s = search.trim();
      filter.$or = [
        { username: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { fullName: { $regex: s, $options: "i" } },
        { phoneNumber: { $regex: s, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select("-password") // ✅ hide password
        .sort({ createdAt: -1, _id: -1 }) // ✅ stable ordering for pagination
        .skip((page - 1) * size)
        .limit(size),
      UserModel.countDocuments(filter),
    ]);

    return { users, total };
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
