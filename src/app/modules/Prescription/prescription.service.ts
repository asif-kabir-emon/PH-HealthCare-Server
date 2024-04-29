import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import prisma from "../../helpers/prisma";
import { IAuthUser } from "../../interfaces/common";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { TPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../helpers/paginationHelper";

const createPrescriptionIntoDB = async (user: IAuthUser, payload: any) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            status: AppointmentStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID,
        },
        include: {
            doctor: true,
        },
    });

    if (appointmentData.doctor.email !== user?.email) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "You are not authorized to create prescription"
        );
    }

    const result = await prisma.prescription.create({
        data: {
            appointmentId: payload.appointmentId,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            instructions: payload.instructions as string,
            followUpDate: payload.followUpDate || null,
        },
        include: {
            patient: true,
        },
    });

    return result;
};

const getPatientPrescriptionFromDB = async (
    user: IAuthUser,
    options: TPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const result = await prisma.prescription.findMany({
        where: {
            patient: {
                email: user?.email,
            },
        },
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? {
                      [options.sortBy]: options.sortOrder,
                  }
                : {
                      createdAt: "desc",
                  },
    });

    const total = await prisma.prescription.count({
        where: {
            patient: {
                email: user?.email,
            },
        },
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        result,
    };
};

export const PrescriptionServices = {
    createPrescriptionIntoDB,
    getPatientPrescriptionFromDB,
};
