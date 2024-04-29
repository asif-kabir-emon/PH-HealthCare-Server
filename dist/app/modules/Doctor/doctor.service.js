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
exports.DoctorServices = void 0;
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../helpers/paginationHelper");
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const doctor_constant_1 = require("./doctor.constant");
const getAllDoctorsFromDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, specialities } = params, filterData = __rest(params, ["searchTerm", "specialities"]);
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: doctor_constant_1.doctorSearchableFields.map((field) => ({
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
                    equals: filterData[key],
                },
            })),
        });
    }
    andConditions.push({
        isDeleted: false,
    });
    const whereConditions = { AND: andConditions };
    const result = yield prisma_1.default.doctor.findMany({
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
    const total = yield prisma_1.default.doctor.count({
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
const getDoctorByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    return result;
});
const deleteDoctorFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const doctorDeletedData = yield transactionClient.doctor.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });
        yield transactionClient.user.update({
            where: {
                email: doctorDeletedData.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return doctorDeletedData;
    }));
    return result;
});
const updateDoctorIntoDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { specialities } = data, doctorData = __rest(data, ["specialities"]);
    const doctorInfo = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.doctor.update({
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
            const deleteSpecialitiesIds = specialities.filter((speciality) => speciality.isDeleted);
            for (const speciality of deleteSpecialitiesIds) {
                yield transactionClient.doctorSpecialities.deleteMany({
                    where: {
                        doctorId: doctorInfo.id,
                        specialityId: speciality.specialitiesId,
                    },
                });
            }
            // Add specialities
            const addSpecialitiesIds = specialities.filter((speciality) => !speciality.isDeleted);
            for (const speciality of addSpecialitiesIds) {
                yield transactionClient.specialities.findUniqueOrThrow({
                    where: {
                        id: speciality.specialitiesId,
                    },
                });
                const isDoctorSpecialityExist = yield prisma_1.default.doctorSpecialities.findFirst({
                    where: {
                        doctorId: doctorInfo.id,
                        specialityId: speciality.specialitiesId,
                    },
                });
                if (!isDoctorSpecialityExist) {
                    yield transactionClient.doctorSpecialities.create({
                        data: {
                            doctorId: doctorInfo.id,
                            specialityId: speciality.specialitiesId,
                        },
                    });
                }
            }
        }
    }));
    const result = yield prisma_1.default.doctor.findUniqueOrThrow({
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
});
exports.DoctorServices = {
    getAllDoctorsFromDB,
    getDoctorByIdFromDB,
    deleteDoctorFromDB,
    updateDoctorIntoDB,
};
