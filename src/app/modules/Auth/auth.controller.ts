import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import config from "../../config";

const loginUser = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUser(req.body);

    const { accessToken, refreshToken, needPasswordChange } = result;

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production" ? true : false,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Logged in successfully!",
        data: {
            accessToken,
            needPasswordChange,
        },
    });
});

const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;

    const result = await AuthServices.refreshToken(refreshToken);

    const { accessToken, needPasswordChange } = result;

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Access token generated successfully!",
        data: {
            accessToken,
            needPasswordChange,
        },
    });
});

const changePassword = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await AuthServices.changePassword(user, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password changed successfully!",
        data: result,
    });
});

const forgetPassword = catchAsync(async (req, res) => {
    const result = await AuthServices.forgetPassword(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message:
            "Reset password token generated successfully! Check your email.",
        data: result,
    });
});

const resetPassword = catchAsync(async (req, res) => {
    const token = req.headers.authorization || "";
    const result = await AuthServices.resetPassword(token, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password reset successfully!",
        data: result,
    });
});

export const AuthControllers = {
    loginUser,
    refreshToken,
    changePassword,
    forgetPassword,
    resetPassword,
};
