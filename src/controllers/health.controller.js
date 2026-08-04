import ApiResponse from "../utils/ApiResponse.js";

export const health = (req, res) => {
    res.status(200).json(
        new ApiResponse(
            200,
            "Server is running"
        )
    );
};