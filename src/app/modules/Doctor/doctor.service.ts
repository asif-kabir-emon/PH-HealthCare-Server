import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../helpers/paginationHelper";
import { TPaginationOptions } from "../../interfaces/pagination";
import prisma from "../../helpers/prisma";
import { TDoctorFilterRequest } from "./doctor.interface";
import { doctorSearchableFields } from "./doctor.constant";

const getAllDoctorsFromDB = async (
    params: TDoctorFilterRequest,
    options: TPaginationOptions
) => {
    const { searchTerm, specialities, ...filterData } = params;
    const { limit, page, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(options);

    const andConditions: Prisma.DoctorWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    if (specialities && specialities.length) {
        andConditions.push({
            doctorSpecialities: {
                some: {
                    specialities: {
                        title: {
                            contains: specialities,
                            mode: "insensitive",
                        },
                    },
                },
            },
        });
    }

    if (Object.keys(filterData).length) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key],
                },
            })),
        });
    }

    andConditions.push({
        isDeleted: false,
    });

    const whereConditions: Prisma.DoctorWhereInput = { AND: andConditions };

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            doctorSpecialities: {
                include: {
                    specialities: true,
                },
            },
        },
    });

    const total = await prisma.doctor.count({
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

const getDoctorByIdFromDB = async (id: any): Promise<Doctor | null> => {
    const result = await prisma.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    return result;
};

const deleteDoctorFromDB = async (id: string): Promise<Doctor | null> => {
    await prisma.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const doctorDeletedData = await transactionClient.doctor.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: doctorDeletedData.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return doctorDeletedData;
    });

    return result;
};

const updateDoctorIntoDB = async (id: string, data: any) => {
    const { specialities, ...doctorData } = data;
    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    await prisma.$transaction(async (transactionClient) => {
        await transactionClient.doctor.update({
            where: {
                id,
            },
            data: doctorData,
            include: {
                doctorSpecialities: true,
            },
        });

        if (specialities && specialities.length) {
            // Delete specialities
            const deleteSpecialitiesIds = specialities.filter(
                (speciality: { isDeleted: boolean }) => speciality.isDeleted
            );

            for (const speciality of deleteSpecialitiesIds) {
                await transactionClient.doctorSpecialities.deleteMany({
                    where: {
                        doctorId: doctorInfo.id,
                        specialityId: speciality.specialitiesId,
                    },
                });
            }

            // Add specialities
            const addSpecialitiesIds = specialities.filter(
                (speciality: { isDeleted: boolean }) => !speciality.isDeleted
            );

            for (const speciality of addSpecialitiesIds) {
                await transactionClient.specialities.findUniqueOrThrow({
                    where: {
                        id: speciality.specialitiesId,
                    },
                });

                const isDoctorSpecialityExist =
                    await prisma.doctorSpecialities.findFirst({
                        where: {
                            doctorId: doctorInfo.id,
                            specialityId: speciality.specialitiesId,
                        },
                    });

                if (!isDoctorSpecialityExist) {
                    await transactionClient.doctorSpecialities.create({
                        data: {
                            doctorId: doctorInfo.id,
                            specialityId: speciality.specialitiesId,
                        },
                    });
                }
            }
        }
    });

    const result = await prisma.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialities: {
                include: {
                    specialities: true,
                },
            },
        },
    });

    return result;
};

export const DoctorServices = {
    getAllDoctorsFromDB,
    getDoctorByIdFromDB,
    deleteDoctorFromDB,
    updateDoctorIntoDB,
};
