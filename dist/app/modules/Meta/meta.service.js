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
exports.MetaServices = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const dashboardMetaDataFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    let metaData;
    switch (user === null || user === void 0 ? void 0 : user.role) {
        case client_1.UserRole.SUPER_ADMIN:
            metaData = getSuperAdminMetaData();
            break;
        case client_1.UserRole.ADMIN:
            metaData = getAdminMetaData();
            break;
        case client_1.UserRole.DOCTOR:
            metaData = getDoctorMetaData(user);
            break;
        case client_1.UserRole.PATIENT:
            metaData = getPatientMetaData(user);
            break;
        default:
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid User Role");
    }
    return metaData;
});
const getSuperAdminMetaData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const appointment = yield prisma_1.default.appointment.count();
    const adminCount = yield prisma_1.default.admin.count();
    const patientCount = yield prisma_1.default.patient.count();
    const doctorCount = yield prisma_1.default.doctor.count();
    const paymentCount = yield prisma_1.default.payment.count();
    const totalRevenue = yield prisma_1.default.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: client_1.PaymentStatus.PAID,
        },
    });
    const barChartData = yield getBarChartData();
    const pieChartData = yield getPieChartData();
    return {
        appointment,
        patientCount,
        adminCount,
        doctorCount,
        paymentCount,
        totalRevenue: ((_a = totalRevenue === null || totalRevenue === void 0 ? void 0 : totalRevenue._sum) === null || _a === void 0 ? void 0 : _a.amount) || 0,
        barChartData,
        pieChartData,
    };
});
const getAdminMetaData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const appointment = yield prisma_1.default.appointment.count();
    const patientCount = yield prisma_1.default.patient.count();
    const doctorCount = yield prisma_1.default.doctor.count();
    const paymentCount = yield prisma_1.default.payment.count();
    const totalRevenue = yield prisma_1.default.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: client_1.PaymentStatus.PAID,
        },
    });
    return {
        appointment,
        patientCount,
        doctorCount,
        paymentCount,
        totalRevenue: ((_b = totalRevenue === null || totalRevenue === void 0 ? void 0 : totalRevenue._sum) === null || _b === void 0 ? void 0 : _b.amount) || 0,
    };
});
const getDoctorMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const appointmentCount = yield prisma_1.default.appointment.count({
        where: {
            doctorId: doctorData.id,
        },
    });
    const patientCount = yield prisma_1.default.appointment.groupBy({
        by: ["patientId"],
        where: {
            doctorId: doctorData.id,
        },
    });
    const reviewCount = yield prisma_1.default.review.count({
        where: {
            doctorId: doctorData.id,
        },
    });
    const totalRevenue = yield prisma_1.default.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            appointment: {
                doctorId: doctorData.id,
            },
            status: client_1.PaymentStatus.PAID,
        },
    });
    const appointmentStatusDistribution = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
        where: {
            doctorId: doctorData.id,
        },
    });
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map((item) => {
        return {
            status: item.status,
            count: item._count.id,
        };
    });
    return {
        appointmentCount,
        reviewCount,
        patientCount: patientCount.length,
        totalRevenue: ((_c = totalRevenue === null || totalRevenue === void 0 ? void 0 : totalRevenue._sum) === null || _c === void 0 ? void 0 : _c.amount) || 0,
        appointmentStatusDistribution: formattedAppointmentStatusDistribution,
    };
});
const getPatientMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const patientData = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const appointmentCount = yield prisma_1.default.appointment.count({
        where: {
            patientId: patientData.id,
        },
    });
    const prescriptionCount = yield prisma_1.default.prescription.count({
        where: {
            patientId: patientData.id,
        },
    });
    const reviewCount = yield prisma_1.default.review.count({
        where: {
            patientId: patientData.id,
        },
    });
    const appointmentStatusDistribution = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
        where: {
            patientId: patientData.id,
        },
    });
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map((item) => {
        return {
            status: item.status,
            count: item._count.id,
        };
    });
    return {
        appointmentCount,
        prescriptionCount: prescriptionCount,
        reviewCount,
        appointmentStatusDistribution: formattedAppointmentStatusDistribution,
    };
});
const getBarChartData = () => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentCountByMonth = yield prisma_1.default.$queryRaw `
        SELECT
            DATE_TRUNC('month', "createdAt") as month,
            CAST(COUNT(*) as INTEGER) as count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC
    `;
    return appointmentCountByMonth;
});
const getPieChartData = () => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentStatusDistribution = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
    });
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map((item) => {
        return {
            status: item.status,
            count: item._count.id,
        };
    });
    return formattedAppointmentStatusDistribution;
});
exports.MetaServices = {
    dashboardMetaDataFromDB,
};
