import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PatientServices } from "./patient.service";
import { pick } from "../../helpers/pick";
import { patientFilterableFields } from "./patient.constant";

const getAllPatients = catchAsync(async (req, res) => {
    const filters = pick(req.query, patientFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await PatientServices.getAllPatientsFromDB(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patients fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getPatientById = catchAsync(async (req, res) => {
    const result = await PatientServices.getPatientByIdFromDB(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient fetched successfully",
        data: result,
    });
});

const deletePatientById = catchAsync(async (req, res) => {
    const result = await PatientServices.deletePatientByIdFromDB(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient deleted successfully",
        data: result,
    });
});

const updatePatient = catchAsync(async (req, res) => {
    const result = await PatientServices.updatePatientIntoDB(
        req.params.id,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient updated successfully",
        data: result,
    });
});

export const PatientControllers = {
    getAllPatients,
    getPatientById,
    deletePatientById,
    updatePatient,
};
