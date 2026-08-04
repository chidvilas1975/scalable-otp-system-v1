import ApiResponse from "../utils/ApiResponse.js";

import asyncHandler from "../middlewares/asyncHandler.js";

import authService from "../services/auth.service.js";

export const sendOtp = asyncHandler(async (req, res) => {

    const { email } = req.validatedData;

    const result = await authService.sendOtp(email);

    res.status(200).json(

        new ApiResponse(

            200,

            "OTP request accepted",

            result

        )

    );
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.validatedData;

  const result = await authService.verifyOtp(email, otp);

  const {user, accessToken, refreshToken} = result;

    res
    .cookie(
        "refreshToken",
        refreshToken,
        {
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge:7*24*60*60*1000
        }
    )
    .status(200)
    .json({

        success:true,

        message:"Login successful",

        data:{
            user,
            accessToken
        }

    });
});


export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,

      message: "Refresh token missing",
    });
  }

  const result = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,

    data: result,
  });
});

export const logout = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    await authService.logout(refreshToken);

    res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        })
        .status(200)
        .json({

            success: true,

            message: "Logged out successfully"

        });

});