import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DoctorScheduleServices } from "./doctorSchedule.service";
import { IAuthUser } from "../../interfaces/common";
import { pick } from "../../helpers/pick";

const createDoctorSchedule = catchAsync(async (req, res) => {
    const result = await DoctorScheduleServices.createDoctorScheduleIntoDB(
        req.user as IAuthUser,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Doctor Schedule created successfully",
        data: result,
    });
});

const getMySchedules = catchAsync(async (req, res) => {
    const filters = pick(req.query, [
        "startDateTime",
        "endDateTime",
        "isBooked",
    ]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    console.log("filters", req.query);

    const result = await DoctorScheduleServices.getMySchedulesFromDB(
        req.user as IAuthUser,
        filters,
        options
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My Schedules fetched successfully",
        data: result,
    });
});

const deleteDoctorSchedule = catchAsync(async (req, res) => {
    const result = await DoctorScheduleServices.deleteDoctorScheduleFromDB(
        req.user as IAuthUser,
        req.params.id
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor Schedule deleted successfully",
        data: result,
    });
});

export const DoctorScheduleControllers = {
    createDoctorSchedule,
    getMySchedules,
    deleteDoctorSchedule,
};
