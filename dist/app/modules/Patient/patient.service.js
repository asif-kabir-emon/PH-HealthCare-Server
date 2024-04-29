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
exports.PatientServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const paginationHelper_1 = require("../../helpers/paginationHelper");
const patient_constant_1 = require("./patient.constant");
const getAllPatientsFromDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: patient_constant_1.patientSearchableFields.map((field) => ({
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
    andConditions.push({
        isDeleted: false,
    });
    const whereConditions = { AND: andConditions };
    const result = yield prisma_1.default.patient.findMany({
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
    const total = yield prisma_1.default.patient.count({
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
const getPatientByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    return result;
});
const deletePatientByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const deletedPatient = yield transactionClient.patient.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });
        yield transactionClient.user.update({
            where: {
                email: deletedPatient.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return deletedPatient;
    }));
    return result;
});
const updatePatientIntoDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientHealthData, medicalReport } = data, patientData = __rest(data, ["patientHealthData", "medicalReport"]);
    const patientInfo = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.patient.update({
            where: { id },
            data: patientData,
            include: {
                medicalReports: true,
                patientHealthData: true,
            },
        });
        if (patientHealthData) {
            yield transactionClient.patientHealthData.upsert({
                where: {
                    patientId: patientInfo.id,
                },
                update: patientHealthData,
                create: Object.assign(Object.assign({}, patientHealthData), { patientId: patientInfo.id }),
            });
        }
        if (medicalReport) {
            yield transactionClient.medicalReport.create({
                data: Object.assign(Object.assign({}, medicalReport), { patientId: patientInfo.id }),
            });
        }
    }));
    const result = yield prisma_1.default.patient.findUnique({
        where: {
            id,
        },
        include: {
            medicalReports: true,
            patientHealthData: true,
        },
    });
    return result;
});
exports.PatientServices = {
    getAllPatientsFromDB,
    getPatientByIdFromDB,
    deletePatientByIdFromDB,
    updatePatientIntoDB,
};
