import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ScheduleServices } from "./schedule.service";
import { pick } from "../../helpers/pick";
import { IAuthUser } from "../../interfaces/common";

const createSchedule = catchAsync(async (req, res) => {
    const result = await ScheduleServices.createScheduleIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Schedule created successfully",
        data: result,
    });
});

const getAllSchedules = catchAsync(async (req, res) => {
    const filters = pick(req.query, ["startDateTime", "endDateTime"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await ScheduleServices.getAllSchedulesFromDB(
        req.user as IAuthUser,
        filters,
        options
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedules fetched successfully",
        data: result,
    });
});

const getScheduleById = catchAsync(async (req, res) => {
    const result = await ScheduleServices.getScheduleByIdFromDB(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule fetched successfully",
        data: result,
    });
});

const deleteScheduleById = catchAsync(async (req, res) => {
    const result = await ScheduleServices.deleteScheduleByIdFromDB(
        req.params.id
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule deleted successfully",
        data: result,
    });
});

export const ScheduleControllers = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    deleteScheduleById,
};
