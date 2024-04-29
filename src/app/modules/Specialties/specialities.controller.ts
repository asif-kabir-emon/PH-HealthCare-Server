import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { SpecialitiesServices } from "./specialities.service";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialitiesServices.createSpecialtyIntoDB(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Speciality added successfully",
        data: result,
    });
});

const getAllSpecialities = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialitiesServices.getAllSpecialitiesFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Specialities fetched successfully",
        data: result,
    });
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await SpecialitiesServices.deleteSpecialtyFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Speciality deleted successfully",
        data: null,
    });
});

export const SpecialitiesControllers = {
    createSpecialty,
    getAllSpecialities,
    deleteSpecialty,
};
