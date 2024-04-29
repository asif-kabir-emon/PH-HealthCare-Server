import { NextFunction, Request, Response } from "express";
import { jwtHelper } from "../helpers/jwtHelper";
import config from "../config";
import prisma from "../helpers/prisma";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";

const auth = (...roles: string[]) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const token = req.headers.authorization;

            if (!token) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    "You are not authorized!"
                );
            }

            const verifiedUser = jwtHelper.verifyToken(
                token,
                config.jwt.access_secret as string
            ) as JwtPayload;

            req.user = verifiedUser;

            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
            }

            const isUserExist = await prisma.user.findUniqueOrThrow({
                where: {
                    id: verifiedUser.id,
                    email: verifiedUser.email,
                    role: verifiedUser.role,
                },
            });

            next();
        }
    );
};

export default auth;
