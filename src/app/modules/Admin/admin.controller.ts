import { AdminServices } from "./admin.service";
import { pick } from "../../helpers/pick";
import { adminFilterableFields } from "./admin.constant";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getAllAdmins = catchAsync(async (req, res) => {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AdminServices.getAllAdminsFromDB(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admins fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getAdminById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await AdminServices.getAdminByIdFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin fetched successfully",
        data: result,
    });
});

const updateAdmin = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const result = await AdminServices.updateAdminIntoDB(id, data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin updated successfully",
        data: result,
    });
});

const deleteAdmin = catchAsync(async (req, res) => {
    const { id } = req.params;

    await AdminServices.deleteAdminFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin deleted successfully",
        data: null,
    });
});

export const AdminControllers = {
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
};
