// import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../../dtos/user.dtos";
// import { UserRepository } from "../../repositories/user.repository";
// import  bcryptjs from "bcryptjs"
// import { HttpError } from "../../error/http-error";

// let userRepository = new UserRepository();

// export class AdminUserService {
//     async createUser(data: CreateUserDTO){
//         const emailCheck = await userRepository.getUserByEmail(data.email);
//         if(emailCheck){
//             throw new HttpError(403, "Email already in use");
//         }
//         const usernameCheck = await userRepository.getUserByUsername(data.username);
//         if(usernameCheck){
//             throw new HttpError(403, "Username already in use");
//         }
//         // hash password
//         const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
//         data.password = hashedPassword;

//         const newUser = await userRepository.createUser(data);
//         return newUser;
//     }

//     async getAllUsers(){
//         const users = await userRepository.getAllUsers();
//         return users;
//     }

//     async deleteUser(id: string){
//         const user = await userRepository.getUserById(id);
//         if(!user){
//             throw new HttpError(404, "User not found");
//         }
//         const deleted = await userRepository.deleteUser(id);
//         return deleted;
//     }

//     async updateUser(id: string, updateData: UpdateUserDTO){
//         const user = await userRepository.getUserById(id);
//         if(!user){
//             throw new HttpError(404, "User not found");
//         }
//         const updatedUser = await userRepository.updateUser(id, updateData);
//         return updatedUser;
//     }

//     async  getUserById(id: string){
//         const user = await userRepository.getUserById(id);
//         if(!user){
//             throw new HttpError(404, "User not found");
//         }
//         return user;
//     }

// }


import { CreateUserDTO, UpdateUserDTO } from "../../dtos/user.dtos";
import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../error/http-error";

let userRepository = new UserRepository();

export class AdminUserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) throw new HttpError(403, "Email already in use");

    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) throw new HttpError(403, "Username already in use");

    data.password = await bcryptjs.hash(data.password, 10);

    return await userRepository.createUser(data);
  }

  async getAllUsers(page?: string, size?: string, search?: string) {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;

    const { users, total } = await userRepository.getAllUsers(
      pageNumber,
      pageSize,
      search
    );

    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { users, pagination };
  }

  async deleteUser(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");
    return await userRepository.deleteUser(id);
  }

  async updateUser(id: string, updateData: UpdateUserDTO) {
    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");
    return await userRepository.updateUser(id, updateData);
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }
}
