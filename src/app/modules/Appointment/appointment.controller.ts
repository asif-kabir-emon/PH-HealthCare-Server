import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AppointmentServices } from "./appointment.service";
import { IAuthUser } from "../../interfaces/common";
import { pick } from "../../helpers/pick";

const createAppointment = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await AppointmentServices.createAppointmentIntoDB(
        user as IAuthUser,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Appointment booked successfully",
        data: result,
    });
});

const getMyAppointments = catchAsync(async (req, res) => {
    const user = req.user;
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await AppointmentServices.getMyAppointmentsFromDB(
        user as IAuthUser,
        filters,
        options
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My appointments",
        data: result,
    });
});

const getAllAppointments = catchAsync(async (req, res) => {
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await AppointmentServices.getAllAppointmentsFromDB(
        filters,
        options
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All appointments",
        data: result,
    });
});

const changeAppointmentStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;
    const result = await AppointmentServices.changeAppointmentStatusIntoDB(
        user as IAuthUser,
        id,
        status
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Appointment status changed successfully",
        data: result,
    });
});

export const AppointmentControllers = {
    createAppointment,
    getMyAppointments,
    getAllAppointments,
    changeAppointmentStatus,
};
