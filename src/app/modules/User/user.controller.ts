import { Request, Response } from "express";
import { UserServices } from "./user.service";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { pick } from "../../helpers/pick";
import { userFilterableFields } from "./user.constant";
import { IAuthUser } from "../../interfaces/common";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await UserServices.createAdminIntoDB(req);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Admin created successfully",
        data: result,
    });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
    const result = await UserServices.createDoctorIntoDB(req);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Doctor created successfully",
        data: result,
    });
});

const createPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await UserServices.createPatientIntoDB(req);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Patient created successfully",
        data: result,
    });
});

const getAllUsers = catchAsync(async (req, res) => {
    const filters = pick(req.query, userFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await UserServices.getAllUserFromDB(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admins fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserServices.changeProfileStatusIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile status updated successfully",
        data: result,
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IAuthUser;
    const result = await UserServices.getMyProfileFromDB(user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile data fetched successfully",
        data: result,
    });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IAuthUser;
    const result = await UserServices.updateMyProfileIntoDB(user, req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});

export const UserControllers = {
    createAdmin,
    createDoctor,
    createPatient,
    getAllUsers,
    changeProfileStatus,
    getMyProfile,
    updateMyProfile,
};
