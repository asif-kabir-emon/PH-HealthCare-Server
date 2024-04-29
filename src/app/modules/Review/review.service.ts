import { AppointmentStatus } from "@prisma/client";
import prisma from "../../helpers/prisma";
import { IAuthUser } from "../../interfaces/common";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createReviewIntoDB = async (user: IAuthUser, payload: any) => {
    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email,
        },
    });

    const appointmentInfo = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            patientId: patientInfo.id,
        },
    });

    if (appointmentInfo.status !== AppointmentStatus.COMPLETED) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Appointment is not completed yet"
        );
    }

    const result = await prisma.$transaction(async (tx) => {
        const result = await tx.review.create({
            data: {
                appointmentId: appointmentInfo.id,
                doctorId: appointmentInfo.doctorId,
                patientId: patientInfo.id,
                rating: payload.rating,
                comment: payload.comment,
            },
        });

        const averageRating = await tx.review.aggregate({
            _avg: {
                rating: true,
            },
            where: {
                doctorId: result.doctorId,
            },
        });

        await tx.doctor.update({
            where: {
                id: result.doctorId,
            },
            data: {
                averageRating: averageRating._avg.rating as number,
            },
        });

        return result;
    });

    return result;
};

export const ReviewServices = {
    createReviewIntoDB,
};
