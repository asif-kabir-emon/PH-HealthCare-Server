import { Prisma } from "@prisma/client";
import prisma from "../../helpers/prisma";
import { IAuthUser } from "../../interfaces/common";
import { paginationHelper } from "../../helpers/paginationHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createDoctorScheduleIntoDB = async (
    user: IAuthUser,
    payload: {
        scheduleIds: string[];
    }
) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email,
        },
    });

    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => {
        return {
            doctorId: doctorData.id,
            scheduleId,
        };
    });

    const result = await prisma.doctorSchedules.createMany({
        data: doctorScheduleData,
    });

    return result;
};

const getMySchedulesFromDB = async (
    user: IAuthUser,
    params: any,
    options: any
) => {
    const { startDateTime, endDateTime, ...filterData } = params;
    const { limit, page, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(options);
    const andConditions: Prisma.DoctorSchedulesWhereInput[] = [];

    if (Object.keys(filterData).length) {
        if (
            typeof filterData.isBooked === "string" &&
            filterData.isBooked === "true"
        ) {
            filterData.isBooked = true;
        } else if (
            typeof filterData.isBooked === "string" &&
            filterData.isBooked === "false"
        ) {
            filterData.isBooked = false;
        }

        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key],
                },
            })),
        });
    }

    if (startDateTime && endDateTime) {
        andConditions.push({
            AND: [
                {
                    schedule: {
                        startDateTime: {
                            gte: new Date(startDateTime),
                        },
                    },
                },
                {
                    schedule: {
                        startDateTime: {
                            lte: new Date(endDateTime),
                        },
                    },
                },
            ],
        });
    }

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email,
        },
    });

    andConditions.push({
        doctorId: {
            equals: doctorData.id,
        },
    });

    const whereConditions: Prisma.DoctorSchedulesWhereInput = {
        AND: andConditions,
    };

    const result = await prisma.doctorSchedules.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy:
            options?.sortsBy && options?.sortOrder
                ? {
                      [options.sortsBy]: options.sortOrder,
                  }
                : {},
    });

    const total = await prisma.doctorSchedules.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
};

const deleteDoctorScheduleFromDB = async (
    user: IAuthUser,
    scheduleId: string
) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email,
        },
    });

    const isBookedSchedule = await prisma.doctorSchedules.findFirst({
        where: {
            doctorId: doctorData.id,
            scheduleId,
            isBooked: true,
        },
    });

    if (isBookedSchedule) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "You can't delete a booked schedule"
        );
    }

    const result = await prisma.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId,
            },
        },
    });

    return result;
};

export const DoctorScheduleServices = {
    createDoctorScheduleIntoDB,
    getMySchedulesFromDB,
    deleteDoctorScheduleFromDB,
};
