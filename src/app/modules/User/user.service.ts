import {
    Admin,
    Doctor,
    Patient,
    Prisma,
    UserRole,
    UserStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";
import config from "../../config";
import prisma from "../../helpers/prisma";
import { fileUploader } from "../../helpers/fileUploader";
import { TPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../helpers/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { IAuthUser } from "../../interfaces/common";

const createAdminIntoDB = async (req: any): Promise<Admin> => {
    const file = req.file;
    let data = req.body;

    if (file) {
        const uploadToCloudinary = (await fileUploader.uploadToCloudinary(
            file,
            file.originalname
        )) as { secure_url: string };
        data.admin.profilePhoto = uploadToCloudinary.secure_url;
    }

    const admin = data.admin;

    const hashedPassword: string = await bcrypt.hash(
        data.password,
        parseInt(config.salt_rounds as string)
    );
    const userData = {
        email: admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
    };
    const adminData = {
        name: admin.name,
        email: admin.email,
        contactNumber: admin.contactNumber,
        profilePhoto: admin?.profilePhoto,
    };
    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData,
        });
        const createdAdminData = await transactionClient.admin.create({
            data: adminData,
        });
        return createdAdminData;
    });
    return result;
};

const createDoctorIntoDB = async (req: any): Promise<Doctor> => {
    const file = req.file;
    let data = req.body;

    if (file) {
        const uploadToCloudinary = (await fileUploader.uploadToCloudinary(
            file,
            file.originalname
        )) as { secure_url: string };
        data.doctor.profilePhoto = uploadToCloudinary.secure_url;
    }

    const doctor = data.doctor;

    const hashedPassword: string = await bcrypt.hash(
        data.password,
        parseInt(config.salt_rounds as string)
    );
    const userData = {
        email: doctor.email,
        password: hashedPassword,
        role: UserRole.DOCTOR,
    };
    const doctorData = {
        name: doctor.name,
        email: doctor.email,
        profilePhoto: doctor?.profilePhoto,
        contactNumber: doctor.contactNumber,
        address: doctor.address,
        registrationNumber: doctor.registrationNumber,
        experience: doctor?.experience,
        gender: doctor.gender,
        appointmentFee: doctor.appointmentFee,
        qualification: doctor.qualification,
        currentWorkplace: doctor.currentWorkplace,
        designation: doctor.designation,
        averageRating: doctor?.averageRating,
    };
    console.log(doctorData);
    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData,
        });
        const createdDoctorData = await transactionClient.doctor.create({
            data: doctorData,
        });
        return createdDoctorData;
    });
    return result;
};

const createPatientIntoDB = async (req: any): Promise<Patient> => {
    const file = req.file;
    let data = req.body;

    if (file) {
        const uploadToCloudinary = (await fileUploader.uploadToCloudinary(
            file,
            file.originalname
        )) as { secure_url: string };
        data.patient.profilePhoto = uploadToCloudinary.secure_url;
    }

    const patient = data.patient;

    const hashedPassword: string = await bcrypt.hash(
        data.password,
        parseInt(config.salt_rounds as string)
    );
    const userData = {
        email: patient.email,
        password: hashedPassword,
        role: UserRole.PATIENT,
    };
    const patientData = {
        name: patient.name,
        email: patient.email,
        contactNumber: patient.contactNumber,
        profilePhoto: patient?.profilePhoto,
        address: patient?.address,
    };
    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData,
        });
        const createdPatientData = await transactionClient.patient.create({
            data: patientData,
        });
        return createdPatientData;
    });
    return result;
};

const getAllUserFromDB = async (params: any, options: TPaginationOptions) => {
    const { searchTerm, ...filterData } = params;
    const { limit, page, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(options);
    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map((field) => ({
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

    const whereConditions: Prisma.UserWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.user.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            admin: true,
            doctor: true,
            patient: true,
        },
    });

    const total = await prisma.user.count({
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

const changeProfileStatusIntoDB = async (id: string, status: UserRole) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const updateUserStatus = await prisma.user.update({
        where: {
            id,
        },
        data: status,
    });

    return updateUserStatus;
};

const getMyProfileFromDB = async (user: IAuthUser) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            id: user?.id,
            email: user?.email,
            status: UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
        },
    });

    let profileInfo: any = {};

    if (userInfo.role === UserRole.SUPER_ADMIN) {
        profileInfo = await prisma.admin.findUnique({
            where: {
                email: user?.email,
            },
        });
    } else if (userInfo.role === UserRole.ADMIN) {
        profileInfo = await prisma.admin.findUnique({
            where: {
                email: user?.email,
            },
        });
    } else if (userInfo.role === UserRole.DOCTOR) {
        profileInfo = await prisma.doctor.findUnique({
            where: {
                email: user?.email,
            },
        });
    } else if (userInfo.role === UserRole.PATIENT) {
        profileInfo = await prisma.patient.findUnique({
            where: {
                email: user?.email,
            },
        });
    }

    return { ...userInfo, ...profileInfo };
};

const updateMyProfileIntoDB = async (user: IAuthUser, req: any) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            id: user?.id,
            status: UserStatus.ACTIVE,
        },
    });

    const file = req.file;
    if (file) {
        const uploadToCloudinary = (await fileUploader.uploadToCloudinary(
            file,
            file.originalname
        )) as { secure_url: string };
        req.body.profilePhoto = uploadToCloudinary?.secure_url;
    }

    let profileInfo: any = {};

    if (userInfo.role === UserRole.SUPER_ADMIN) {
        profileInfo = await prisma.admin.update({
            where: {
                email: user?.email,
            },
            data: req.body,
        });
    } else if (userInfo.role === UserRole.ADMIN) {
        profileInfo = await prisma.admin.update({
            where: {
                email: user?.email,
            },
            data: req.body,
        });
    } else if (userInfo.role === UserRole.DOCTOR) {
        profileInfo = await prisma.doctor.update({
            where: {
                email: user?.email,
            },
            data: req.body,
        });
    } else if (userInfo.role === UserRole.PATIENT) {
        profileInfo = await prisma.patient.update({
            where: {
                email: user?.email,
            },
            data: req.body,
        });
    }

    return profileInfo;
};

export const UserServices = {
    createAdminIntoDB,
    createDoctorIntoDB,
    createPatientIntoDB,
    getAllUserFromDB,
    changeProfileStatusIntoDB,
    getMyProfileFromDB,
    updateMyProfileIntoDB,
};
