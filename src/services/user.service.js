import userRepository from "../repositories/user.repository.js";
import ApiError from "../utils/ApiError.js";

class UserService {

    async createUser(email) {

        const existingUser = await userRepository.findByEmail(email);

        if (existingUser) {
            throw new ApiError(409, "User already exists");
        }

        return await userRepository.create({
            email
        });

    }

    async getUser(email) {

        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return user;

    }

}

export default new UserService();