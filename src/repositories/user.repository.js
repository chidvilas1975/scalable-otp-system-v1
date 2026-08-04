import User from "../models/user.model.js";

class UserRepository {

    async create(data) {
        return await User.create(data);
    }

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async update(id, data) {
        return await User.findByIdAndUpdate(
            id,
            data,
            {
                new: true
            }
        );
    }

    async updateRefreshToken(id,refreshToken){
        return await User.findByIdAndUpdate(
            id,

            {
                refreshToken,
            },

            {
                new: true,
            },
        );
    }

    async clearRefreshToken(id) {

        return await User.findByIdAndUpdate(

            id,

            {
                $unset: {
                    refreshToken: ""
                }
            },

            {
                new: true
            }

        );

    }

    async findById(id){
        return await User.findById(id);
    }

}

export default new UserRepository();