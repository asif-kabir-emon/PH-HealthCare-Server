import bcrypt from "bcrypt";
import prisma from "../../helpers/prisma";
import { jwtHelper } from "../../helpers/jwtHelper";
import { Prisma, UserStatus } from "@prisma/client";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import emailSender from "../../utils/emailSender";

const loginUser = async (payload: { email: string; password: string }) => {
    const userData = await prisma.user.findFirstOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE,
        },
    });

    const isCorrectPassword: boolean = await bcrypt.compare(
        payload.password,
        userData.password
    );

    if (!isCorrectPassword) {
        throw new Error("Invalid email or password");
    }

    const jwtData = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
    };

    const accessToken = jwtHelper.generateToken(
        jwtData,
        config.jwt.access_secret as string,
        config.jwt.access_token_expires_in as string
    );
    const refreshToken = jwtHelper.generateToken(
        jwtData,
        config.jwt.refresh_secret as string,
        config.jwt.refresh_token_expires_in as string
    );

    return {
        accessToken,
        refreshToken,
        needPasswordChange: userData.needPasswordChange,
    };
};

const refreshToken = async (token: string) => {
    const decodedData = jwtHelper.verifyToken(
        token,
        config.jwt.refresh_secret as string
    );

    if (!decodedData) {
        throw new Error("Invalid token!!! You are not authorized!");
    }

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id: decodedData.id,
            email: decodedData.email,
            role: decodedData.role,
            status: UserStatus.ACTIVE,
        },
    });

    const jwtData = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
    };

    const accessToken = jwtHelper.generateToken(
        jwtData,
        config.jwt.access_secret as string,
        config.jwt.access_token_expires_in as string
    );

    return {
        accessToken,
        needPasswordChange: userData.needPasswordChange,
    };
};

const changePassword = async (
    user: JwtPayload,
    payload: {
        oldPassword: string;
        newPassword: string;
    }
) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: UserStatus.ACTIVE,
        },
    });

    const isCorrectPassword: boolean = await bcrypt.compare(
        payload.oldPassword,
        userData.password
    );

    if (!isCorrectPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect Password");
    }

    const hashedPassword: string = await bcrypt.hash(
        payload.newPassword,
        parseInt(config.salt_rounds as string)
    );

    await prisma.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false,
        },
    });

    return {
        message: "Password changed successfully",
    };
};

const forgetPassword = async (payload: { email: string }) => {
    const userData = await prisma.user.findFirstOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE,
        },
    });

    const resetPasswordToken = jwtHelper.generateToken(
        {
            id: userData.id,
            email: userData.email,
            role: userData.role,
        },
        config.jwt.reset_password_secret as string,
        config.jwt.reset_password_expires_in as string
    );

    const resetPasswordLink =
        config.reset_password_url +
        `?email=${userData.email}&token=${resetPasswordToken}`;

    await emailSender({
        email: userData.email,
        subject: "Reset Password",
        html: `
            <div>
                <h1>Reset Password</h1>
                <p>Dear user,</p>
                <p>Your reset password link 
                    <a href="${resetPasswordLink}">
                        <button>Reset Password</button>
                    </a>
                </p>
            </div>
        `,
    });
};

const resetPassword = async (
    token: string,
    payload: {
        email: string;
        newPassword: string;
    }
) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE,
        },
    });

    const isValidToken = jwtHelper.verifyToken(
        token,
        config.jwt.reset_password_secret as string
    );

    if (!isValidToken) {
        throw new ApiError(httpStatus.FORBIDDEN, "Invalid Token");
    }

    const hashedPassword: string = await bcrypt.hash(
        payload.newPassword,
        parseInt(config.salt_rounds as string)
    );

    await prisma.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false,
        },
    });
};

export const AuthServices = {
    loginUser,
    refreshToken,
    changePassword,
    forgetPassword,
    resetPassword,
};
