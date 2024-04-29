"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const fileUploader_1 = require("../../helpers/fileUploader");
const paginationHelper_1 = require("../../helpers/paginationHelper");
const user_constant_1 = require("./user.constant");
const createAdminIntoDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    let data = req.body;
    if (file) {
        const uploadToCloudinary = (yield fileUploader_1.fileUploader.uploadToCloudinary(file, file.originalname));
        data.admin.profilePhoto = uploadToCloudinary.secure_url;
    }
    const admin = data.admin;
    const hashedPassword = yield bcrypt_1.default.hash(data.password, parseInt(config_1.default.salt_rounds));
    const userData = {
        email: admin.email,
        password: hashedPassword,
        role: client_1.UserRole.ADMIN,
    };
    const adminData = {
        name: admin.name,
        email: admin.email,
        contactNumber: admin.contactNumber,
        profilePhoto: admin === null || admin === void 0 ? void 0 : admin.profilePhoto,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.user.create({
            data: userData,
        });
        const createdAdminData = yield transactionClient.admin.create({
            data: adminData,
        });
        return createdAdminData;
    }));
    return result;
});
const createDoctorIntoDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    let data = req.body;
    if (file) {
        const uploadToCloudinary = (yield fileUploader_1.fileUploader.uploadToCloudinary(file, file.originalname));
        data.doctor.profilePhoto = uploadToCloudinary.secure_url;
    }
    const doctor = data.doctor;
    const hashedPassword = yield bcrypt_1.default.hash(data.password, parseInt(config_1.default.salt_rounds));
    const userData = {
        email: doctor.email,
        password: hashedPassword,
        role: client_1.UserRole.DOCTOR,
    };
    const doctorData = {
        name: doctor.name,
        email: doctor.email,
        profilePhoto: doctor === null || doctor === void 0 ? void 0 : doctor.profilePhoto,
        contactNumber: doctor.contactNumber,
        address: doctor.address,
        registrationNumber: doctor.registrationNumber,
        experience: doctor === null || doctor === void 0 ? void 0 : doctor.experience,
        gender: doctor.gender,
        appointmentFee: doctor.appointmentFee,
        qualification: doctor.qualification,
        currentWorkplace: doctor.currentWorkplace,
        designation: doctor.designation,
        averageRating: doctor === null || doctor === void 0 ? void 0 : doctor.averageRating,
    };
    console.log(doctorData);
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.user.create({
            data: userData,
        });
        const createdDoctorData = yield transactionClient.doctor.create({
            data: doctorData,
        });
        return createdDoctorData;
    }));
    return result;
});
const createPatientIntoDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    let data = req.body;
    if (file) {
        const uploadToCloudinary = (yield fileUploader_1.fileUploader.uploadToCloudinary(file, file.originalname));
        data.patient.profilePhoto = uploadToCloudinary.secure_url;
    }
    const patient = data.patient;
    const hashedPassword = yield bcrypt_1.default.hash(data.password, parseInt(config_1.default.salt_rounds));
    const userData = {
        email: patient.email,
        password: hashedPassword,
        role: client_1.UserRole.PATIENT,
    };
    const patientData = {
        name: patient.name,
        email: patient.email,
        contactNumber: patient.contactNumber,
        profilePhoto: patient === null || patient === void 0 ? void 0 : patient.profilePhoto,
        address: patient === null || patient === void 0 ? void 0 : patient.address,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.user.create({
            data: userData,
        });
        const createdPatientData = yield transactionClient.patient.create({
            data: patientData,
        });
        return createdPatientData;
    }));
    return result;
});
const getAllUserFromDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchableFields.map((field) => ({
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
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.user.findMany({
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
    const total = yield prisma_1.default.user.count({
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
});
const changeProfileStatusIntoDB = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const updateUserStatus = yield prisma_1.default.user.update({
        where: {
            id,
        },
        data: status,
    });
    return updateUserStatus;
});
const getMyProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: user === null || user === void 0 ? void 0 : user.id,
            email: user === null || user === void 0 ? void 0 : user.email,
            status: client_1.UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
        },
    });
    let profileInfo = {};
    if (userInfo.role === client_1.UserRole.SUPER_ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUnique({
            where: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    else if (userInfo.role === client_1.UserRole.ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUnique({
            where: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    else if (userInfo.role === client_1.UserRole.DOCTOR) {
        profileInfo = yield prisma_1.default.doctor.findUnique({
            where: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    else if (userInfo.role === client_1.UserRole.PATIENT) {
        profileInfo = yield prisma_1.default.patient.findUnique({
            where: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    return Object.assign(Object.assign({}, userInfo), profileInfo);
});
const updateMyProfileIntoDB = (user, req) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: user === null || user === void 0 ? void 0 : user.id,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const file = req.file;
    if (file) {
        const uploadToCloudinary = (yield fileUploader_1.fileUploader.uploadToCloudinary(file, file.originalname));
        req.body.profilePhoto = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    let profileInfo = {};
    if (userInfo.role === client_1.UserRole.SUPER_ADMIN) {
        profileInfo = yield prisma_1.default.admin.update({
            where: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
            data: req.body,
        });
    }
    else if (userInfo.role === client_1.UserRole.ADMIN) {
        profileInfo = yield prisma_1.default.admin.update({
            where: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
            data: req.body,
        });
    }
    else if (userInfo.role === client_1.UserRole.DOCTOR) {
        profileInfo = yield prisma_1.default.doctor.update({
            where: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
            data: req.body,
        });
    }
    else if (userInfo.role === client_1.UserRole.PATIENT) {
        profileInfo = yield prisma_1.default.patient.update({
            where: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
            data: req.body,
        });
    }
    return profileInfo;
});
exports.UserServices = {
    createAdminIntoDB,
    createDoctorIntoDB,
    createPatientIntoDB,
    getAllUserFromDB,
    changeProfileStatusIntoDB,
    getMyProfileFromDB,
    updateMyProfileIntoDB,
};
