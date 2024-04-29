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
exports.AppointmentServices = void 0;
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const uuid_1 = require("uuid");
const paginationHelper_1 = require("../../helpers/paginationHelper");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const createAppointmentIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const patientData = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
        },
    });
    yield prisma_1.default.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked: false,
        },
    });
    const videoCallingId = (0, uuid_1.v4)();
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const appointmentData = yield transactionClient.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId,
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true,
            },
        });
        yield transactionClient.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId,
                },
            },
            data: {
                isBooked: true,
                appointmentId: appointmentData.id,
            },
        });
        const today = new Date();
        const transactionId = "PH-HealthCare-" +
            today.getFullYear() +
            "-" +
            today.getMonth() +
            "-" +
            today.getDate() +
            "-" +
            today.getHours() +
            "-" +
            today.getMinutes();
        yield transactionClient.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId,
            },
        });
        return appointmentData;
    }));
    return result;
});
const getMyAppointmentsFromDB = (user, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const filterData = __rest(filters, []);
    const andConditions = [];
    if (Object.keys(filterData).length > 0) {
        Object.keys(filterData).forEach((key) => {
            andConditions.push({
                [key]: filterData[key],
            });
        });
    }
    if ((user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    else {
        andConditions.push({
            doctor: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.appointment.findMany({
        where: Object.assign({}, whereConditions),
        include: (user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.PATIENT
            ? { doctor: true }
            : {
                patient: {
                    include: {
                        medicalReports: true,
                        patientHealthData: true,
                    },
                },
            },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    });
    const total = yield prisma_1.default.appointment.count({
        where: Object.assign({}, whereConditions),
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
const getAllAppointmentsFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const filterData = __rest(filters, []);
    const andConditions = [];
    if (Object.keys(filterData).length > 0) {
        Object.keys(filterData).forEach((key) => {
            andConditions.push({
                [key]: filterData[key],
            });
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.appointment.findMany({
        where: Object.assign({}, whereConditions),
        include: {
            patient: true,
            doctor: true,
            schedule: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    });
    const total = yield prisma_1.default.appointment.count({
        where: Object.assign({}, whereConditions),
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
const changeAppointmentStatusIntoDB = (user, appointmentId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentData = yield prisma_1.default.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true,
        },
    });
    if ((user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.DOCTOR &&
        (user === null || user === void 0 ? void 0 : user.email) !== appointmentData.doctor.email) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You are not authorized to change status of this appointment");
    }
    const result = yield prisma_1.default.appointment.update({
        where: {
            id: appointmentId,
        },
        data: {
            status,
        },
    });
    return result;
});
const cancelUnpaidAppointmentsIntoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const unpaidAppointments = yield prisma_1.default.appointment.findMany({
        where: {
            paymentStatus: client_1.PaymentStatus.UNPAID,
            createdAt: {
                lte: thirtyMinutesAgo,
            },
        },
    });
    const appointmentIdsToCancel = unpaidAppointments.map((appointment) => appointment.id);
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel,
                },
            },
        });
        yield transactionClient.appointment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel,
                },
            },
        });
        for (const unpaidAppointment of unpaidAppointments) {
            yield transactionClient.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unpaidAppointment.doctorId,
                        scheduleId: unpaidAppointment.scheduleId,
                    },
                },
                data: {
                    isBooked: false,
                    appointmentId: null,
                },
            });
        }
    }));
});
exports.AppointmentServices = {
    createAppointmentIntoDB,
    getMyAppointmentsFromDB,
    getAllAppointmentsFromDB,
    changeAppointmentStatusIntoDB,
    cancelUnpaidAppointmentsIntoDB,
};
