"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const jwtHelper_1 = require("../../helpers/jwtHelper");
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const emailSender_1 = __importDefault(require("../../utils/emailSender"));
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findFirstOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isCorrectPassword = yield bcrypt_1.default.compare(payload.password, userData.password);
    if (!isCorrectPassword) {
        throw new Error("Invalid email or password");
    }
    const jwtData = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
    };
    const accessToken = jwtHelper_1.jwtHelper.generateToken(jwtData, config_1.default.jwt.access_secret, config_1.default.jwt.access_token_expires_in);
    const refreshToken = jwtHelper_1.jwtHelper.generateToken(jwtData, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_token_expires_in);
    return {
        accessToken,
        refreshToken,
        needPasswordChange: userData.needPasswordChange,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedData = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.refresh_secret);
    if (!decodedData) {
        throw new Error("Invalid token!!! You are not authorized!");
    }
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: decodedData.id,
            email: decodedData.email,
            role: decodedData.role,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const jwtData = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
    };
    const accessToken = jwtHelper_1.jwtHelper.generateToken(jwtData, config_1.default.jwt.access_secret, config_1.default.jwt.access_token_expires_in);
    return {
        accessToken,
        needPasswordChange: userData.needPasswordChange,
    };
});
const changePassword = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isCorrectPassword = yield bcrypt_1.default.compare(payload.oldPassword, userData.password);
    if (!isCorrectPassword) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Incorrect Password");
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload.newPassword, parseInt(config_1.default.salt_rounds));
    yield prisma_1.default.user.update({
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
});
const forgetPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findFirstOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const resetPasswordToken = jwtHelper_1.jwtHelper.generateToken({
        id: userData.id,
        email: userData.email,
        role: userData.role,
    }, config_1.default.jwt.reset_password_secret, config_1.default.jwt.reset_password_expires_in);
    const resetPasswordLink = config_1.default.reset_password_url +
        `?email=${userData.email}&token=${resetPasswordToken}`;
    yield (0, emailSender_1.default)({
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
});
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isValidToken = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.reset_password_secret);
    if (!isValidToken) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Invalid Token");
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload.newPassword, parseInt(config_1.default.salt_rounds));
    yield prisma_1.default.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false,
        },
    });
});
exports.AuthServices = {
    loginUser,
    refreshToken,
    changePassword,
    forgetPassword,
    resetPassword,
};
