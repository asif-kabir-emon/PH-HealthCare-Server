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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const paginationHelper_1 = require("../../helpers/paginationHelper");
const createPrescriptionIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentData = yield prisma_1.default.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            status: client_1.AppointmentStatus.COMPLETED,
            paymentStatus: client_1.PaymentStatus.PAID,
        },
        include: {
            doctor: true,
        },
    });
    if (appointmentData.doctor.email !== (user === null || user === void 0 ? void 0 : user.email)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You are not authorized to create prescription");
    }
    const result = yield prisma_1.default.prescription.create({
        data: {
            appointmentId: payload.appointmentId,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            instructions: payload.instructions,
            followUpDate: payload.followUpDate || null,
        },
        include: {
            patient: true,
        },
    });
    return result;
});
const getPatientPrescriptionFromDB = (user, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const result = yield prisma_1.default.prescription.findMany({
        where: {
            patient: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        },
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? {
                [options.sortBy]: options.sortOrder,
            }
            : {
                createdAt: "desc",
            },
    });
    const total = yield prisma_1.default.prescription.count({
        where: {
            patient: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
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
});
exports.PrescriptionServices = {
    createPrescriptionIntoDB,
    getPatientPrescriptionFromDB,
};
