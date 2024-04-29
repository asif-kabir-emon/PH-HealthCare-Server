import { paginationHelper } from "./../../helpers/paginationHelper";
import { Admin, Prisma, UserStatus } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
import prisma from "../../helpers/prisma";
import { TAdminFilterRequest } from "./admin.interface";
import { TPaginationOptions } from "../../interfaces/pagination";

const getAllAdminsFromDB = async (
    params: TAdminFilterRequest,
    options: TPaginationOptions
) => {
    const { searchTerm, ...filterData } = params;
    const { limit, page, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(options);
    const andConditions: Prisma.AdminWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: adminSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
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

    const whereConditions: Prisma.AdminWhereInput = { AND: andConditions };

    const result = await prisma.admin.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });

    const total = await prisma.admin.count({
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

const getAdminByIdFromDB = async (id: string): Promise<Admin | null> => {
    const result = await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    return result;
};

const updateAdminIntoDB = async (
    id: string,
    data: Partial<Admin>
): Promise<Admin | null> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    const result = await prisma.admin.update({
        where: {
            id,
            isDeleted: false,
        },
        data,
    });

    return result;
};

const deleteAdminFromDB = async (id: string): Promise<Admin | null> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeletedData = await transactionClient.admin.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: adminDeletedData.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return adminDeletedData;
    });

    return result;
};

export const AdminServices = {
    getAllAdminsFromDB,
    getAdminByIdFromDB,
    updateAdminIntoDB,
    deleteAdminFromDB,
};
