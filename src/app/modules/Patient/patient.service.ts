import { Patient, Prisma, UserStatus } from "@prisma/client";
import prisma from "../../helpers/prisma";
import { paginationHelper } from "../../helpers/paginationHelper";
import { patientSearchableFields } from "./patient.constant";
import { TPatientFilterRequest, TPatientUpdate } from "./patient.interface";
import { TPaginationOptions } from "../../interfaces/pagination";

const getAllPatientsFromDB = async (
    params: TPatientFilterRequest,
    options: TPaginationOptions
) => {
    const { searchTerm, ...filterData } = params;
    const { limit, page, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(options);

    const andConditions: Prisma.PatientWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: patientSearchableFields.map((field) => ({
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

    const whereConditions: Prisma.PatientWhereInput = { AND: andConditions };

    const result = await prisma.patient.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            medicalReports: true,
            patientHealthData: true,
        },
    });

    const total = await prisma.patient.count({
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

const getPatientByIdFromDB = async (id: string) => {
    const result = await prisma.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    return result;
};

const deletePatientByIdFromDB = async (id: string) => {
    const result = await prisma.$transaction(async (transactionClient) => {
        const deletedPatient = await transactionClient.patient.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: deletedPatient.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return deletedPatient;
    });

    return result;
};

const updatePatientIntoDB = async (
    id: string,
    data: TPatientUpdate
): Promise<Patient | null> => {
    const { patientHealthData, medicalReport, ...patientData } = data;

    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    await prisma.$transaction(async (transactionClient) => {
        await transactionClient.patient.update({
            where: { id },
            data: patientData,
            include: {
                medicalReports: true,
                patientHealthData: true,
            },
        });

        if (patientHealthData) {
            await transactionClient.patientHealthData.upsert({
                where: {
                    patientId: patientInfo.id,
                },
                update: patientHealthData,
                create: { ...patientHealthData, patientId: patientInfo.id },
            });
        }

        if (medicalReport) {
            await transactionClient.medicalReport.create({
                data: { ...medicalReport, patientId: patientInfo.id },
            });
        }
    });

    const result = await prisma.patient.findUnique({
        where: {
            id,
        },
        include: {
            medicalReports: true,
            patientHealthData: true,
        },
    });

    return result;
};

export const PatientServices = {
    getAllPatientsFromDB,
    getPatientByIdFromDB,
    deletePatientByIdFromDB,
    updatePatientIntoDB,
};
