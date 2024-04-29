import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MetaServices } from "./meta.service";
import { IAuthUser } from "../../interfaces/common";

const dashboardMetaData = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await MetaServices.dashboardMetaDataFromDB(
        user as IAuthUser
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Dashboard Meta Data Fetched Successfully",
        data: result,
    });
});

export const MetaControllers = {
    dashboardMetaData,
};
