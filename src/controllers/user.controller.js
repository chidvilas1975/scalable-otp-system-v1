import ApiResponse from "../utils/ApiResponse.js";

import userService from "../services/user.service.js";

import asyncHandler from "../middlewares/asyncHandler.js";

import { createUserSchema } from "../validations/user.validation.js";

export const createUser = asyncHandler(async (req, res) => {

    const data = createUserSchema.parse(req.body);

    const user = await userService.createUser(data.email);

    res.status(201).json(

        new ApiResponse(

            201,

            "User created successfully",

            user

        )

    );

});

export const getUser = asyncHandler(async (req, res) => {

    const { email } = req.params;

    const user = await userService.getUser(email);

    res.json(

        new ApiResponse(

            200,

            "User fetched successfully",

            user

        )

    );

});

export const getProfile = async(req,res)=>{


    res.status(200).json({

        success:true,

        user:req.user

    });


};