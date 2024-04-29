import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PrescriptionServices } from "./prescription.service";
import { IAuthUser } from "../../interfaces/common";
import { pick } from "../../helpers/pick";

const createPrescription = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await PrescriptionServices.createPrescriptionIntoDB(
        user as IAuthUser,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Prescription created successfully",
        data: result,
    });
});

const patientPrescription = catchAsync(async (req, res) => {
    const user = req.user;
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await PrescriptionServices.getPatientPrescriptionFromDB(
        user as IAuthUser,
        options
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient prescription fetched successfully",
        meta: result.meta,
        data: result.result,
    });
});

export const PrescriptionControllers = {
    createPrescription,
    patientPrescription,
};
