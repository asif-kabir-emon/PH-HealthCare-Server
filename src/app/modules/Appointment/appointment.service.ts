import prisma from "../../helpers/prisma";
import { IAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from "uuid";
import { TPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../helpers/paginationHelper";
import {
    AppointmentStatus,
    PaymentStatus,
    Prisma,
    UserRole,
} from "@prisma/client";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createAppointmentIntoDB = async (user: IAuthUser, payload: any) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email,
        },
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
        },
    });

    await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked: false,
        },
    });

    const videoCallingId: string = uuidv4();

    const result = await prisma.$transaction(async (transactionClient) => {
        const appointmentData = await transactionClient.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId,
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true,
            },
        });

        await transactionClient.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId,
                },
            },
            data: {
                isBooked: true,
                appointmentId: appointmentData.id,
            },
        });

        const today = new Date();
        const transactionId =
            "PH-HealthCare-" +
            today.getFullYear() +
            "-" +
            today.getMonth() +
            "-" +
            today.getDate() +
            "-" +
            today.getHours() +
            "-" +
            today.getMinutes();

        await transactionClient.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId,
            },
        });

        return appointmentData;
    });

    return result;
};

const getMyAppointmentsFromDB = async (
    user: IAuthUser,
    filters: any,
    options: TPaginationOptions
) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { ...filterData } = filters;

    const andConditions: Prisma.AppointmentWhereInput[] = [];

    if (Object.keys(filterData).length > 0) {
        Object.keys(filterData).forEach((key) => {
            andConditions.push({
                [key]: filterData[key],
            });
        });
    }

    if (user?.role === UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user?.email,
            },
        });
    } else {
        andConditions.push({
            doctor: {
                email: user?.email,
            },
        });
    }

    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
        where: {
            ...whereConditions,
        },
        include:
            user?.role === UserRole.PATIENT
                ? { doctor: true }
                : {
                      patient: {
                          include: {
                              medicalReports: true,
                              patientHealthData: true,
                          },
                      },
                  },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    });

    const total = await prisma.appointment.count({
        where: {
            ...whereConditions,
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

const getAllAppointmentsFromDB = async (
    filters: any,
    options: TPaginationOptions
) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { ...filterData } = filters;

    const andConditions: Prisma.AppointmentWhereInput[] = [];

    if (Object.keys(filterData).length > 0) {
        Object.keys(filterData).forEach((key) => {
            andConditions.push({
                [key]: filterData[key],
            });
        });
    }

    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
        where: {
            ...whereConditions,
        },
        include: {
            patient: true,
            doctor: true,
            schedule: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    });

    const total = await prisma.appointment.count({
        where: {
            ...whereConditions,
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

const changeAppointmentStatusIntoDB = async (
    user: IAuthUser,
    appointmentId: string,
    status: AppointmentStatus
) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true,
        },
    });

    if (
        user?.role === UserRole.DOCTOR &&
        user?.email !== appointmentData.doctor.email
    ) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "You are not authorized to change status of this appointment"
        );
    }

    const result = await prisma.appointment.update({
        where: {
            id: appointmentId,
        },
        data: {
            status,
        },
    });

    return result;
};

const cancelUnpaidAppointmentsIntoDB = async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unpaidAppointments = await prisma.appointment.findMany({
        where: {
            paymentStatus: PaymentStatus.UNPAID,
            createdAt: {
                lte: thirtyMinutesAgo,
            },
        },
    });

    const appointmentIdsToCancel = unpaidAppointments.map(
        (appointment) => appointment.id
    );

    await prisma.$transaction(async (transactionClient) => {
        await transactionClient.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel,
                },
            },
        });

        await transactionClient.appointment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel,
                },
            },
        });

        for (const unpaidAppointment of unpaidAppointments) {
            await transactionClient.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unpaidAppointment.doctorId,
                        scheduleId: unpaidAppointment.scheduleId,
                    },
                },
                data: {
                    isBooked: false,
                    appointmentId: null,
                },
            });
        }
    });
};

export const AppointmentServices = {
    createAppointmentIntoDB,
    getMyAppointmentsFromDB,
    getAllAppointmentsFromDB,
    changeAppointmentStatusIntoDB,
    cancelUnpaidAppointmentsIntoDB,
};
