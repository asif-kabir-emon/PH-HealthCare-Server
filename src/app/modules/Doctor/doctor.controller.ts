import httpStatus from "http-status";
import { pick } from "../../helpers/pick";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { doctorFilterableFields } from "./doctor.constant";
import { DoctorServices } from "./doctor.service";

const getAllDoctors = catchAsync(async (req, res) => {
    const filters = pick(req.query, doctorFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await DoctorServices.getAllDoctorsFromDB(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctors fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getDoctorById = catchAsync(async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const result = await DoctorServices.getDoctorByIdFromDB(user, id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor fetched successfully",
        data: result,
    });
});

const deleteDoctorById = catchAsync(async (req, res) => {
    const { id } = req.params;

    await DoctorServices.deleteDoctorFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor deleted successfully",
        data: null,
    });
});

const updateDoctor = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const result = await DoctorServices.updateDoctorIntoDB(id, data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor updated successfully",
        data: result,
    });
});

export const DoctorControllers = {
    getAllDoctors,
    getDoctorById,
    deleteDoctorById,
    updateDoctor,
};
