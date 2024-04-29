import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { ReviewServices } from "./review.service";

const createReview = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await ReviewServices.createReviewIntoDB(
        user as IAuthUser,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review created successfully",
        data: result,
    });
});

export const ReviewControllers = {
    createReview,
};
