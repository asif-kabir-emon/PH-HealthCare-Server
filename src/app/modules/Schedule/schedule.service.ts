import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../helpers/prisma";
import { TSchedule, TScheduleFilters } from "./schedule.interface";
import { Prisma, Schedule } from "@prisma/client";
import { TPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";

const createScheduleIntoDB = async (data: TSchedule): Promise<Schedule[]> => {
    const { startDate, endDate, startTime, endTime } = data;

    const intervalTime = 30; // 30 minutes interval
    const schedules = [];

    const currentDate = new Date(startDate); // start date
    const lastDate = new Date(endDate); // end date

    while (currentDate <= lastDate) {
        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0])
                ),
                Number(startTime.split(":")[1])
            )
        );

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0])
                ),
                Number(endTime.split(":")[1])
            )
        );

        while (startDateTime < endDateTime) {
            const scheduleData = {
                startDateTime: startDateTime,
                endDateTime: addMinutes(startDateTime, intervalTime),
            };

            const existingSchedule = await prisma.schedule.findFirst({
                where: scheduleData,
            });

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData,
                });

                schedules.push(result);
            }

            startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
};

const getAllSchedulesFromDB = async (
    user: IAuthUser,
    params: TScheduleFilters,
    options: TPaginationOptions
) => {
    const { startDateTime, endDateTime, ...filterData } = params;
    const { limit, page, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(options);
    const andConditions: Prisma.ScheduleWhereInput[] = [];

    if (Object.keys(filterData).length) {
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
                    startDateTime: {
                        gte: new Date(startDateTime),
                    },
                },
                {
                    startDateTime: {
                        lte: new Date(endDateTime),
                    },
                },
            ],
        });
    }

    const doctorSchedules = await prisma.doctorSchedules.findMany({
        where: {
            doctor: {
                email: user?.email,
            },
        },
    });

    const doctorScheduleIds = doctorSchedules.map(
        (schedule) => schedule.scheduleId
    );

    andConditions.push({
        id: {
            notIn: doctorScheduleIds,
        },
    });

    const whereConditions: Prisma.ScheduleWhereInput = { AND: andConditions };

    const result = await prisma.schedule.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });

    const total = await prisma.schedule.count({
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

const getScheduleByIdFromDB = async (id: string) => {
    const result = await prisma.schedule.findUniqueOrThrow({
        where: {
            id,
        },
    });

    return result;
};

const deleteScheduleByIdFromDB = async (id: string) => {
    const result = await prisma.schedule.delete({
        where: {
            id,
        },
    });

    return result;
};

export const ScheduleServices = {
    createScheduleIntoDB,
    getAllSchedulesFromDB,
    getScheduleByIdFromDB,
    deleteScheduleByIdFromDB,
};
