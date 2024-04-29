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
const jwtHelper_1 = require("../helpers/jwtHelper");
const config_1 = __importDefault(require("../config"));
const prisma_1 = __importDefault(require("../helpers/prisma"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const auth = (...roles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.headers.authorization;
        if (!token) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
        }
        const verifiedUser = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.access_secret);
        req.user = verifiedUser;
        if (roles.length && !roles.includes(verifiedUser.role)) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
        }
        const isUserExist = yield prisma_1.default.user.findUniqueOrThrow({
            where: {
                id: verifiedUser.id,
                email: verifiedUser.email,
                role: verifiedUser.role,
            },
        });
        next();
    }));
};
exports.default = auth;
