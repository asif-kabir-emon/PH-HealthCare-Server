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
exports.PaymentServices = void 0;
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const ssl_service_1 = require("../SSL/ssl.service");
const client_1 = require("@prisma/client");
const initPayment = (appointmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentInfo = yield prisma_1.default.payment.findUniqueOrThrow({
        where: {
            appointmentId,
        },
        include: {
            appointment: {
                include: {
                    patient: true,
                },
            },
        },
    });
    const initPaymentInfo = {
        amount: paymentInfo.amount,
        transactionId: paymentInfo.transactionId,
        name: paymentInfo.appointment.patient.name,
        email: paymentInfo.appointment.patient.email,
        address: paymentInfo.appointment.patient.address,
        phoneNumber: paymentInfo.appointment.patient.contactNumber,
    };
    const result = yield ssl_service_1.SSLServices.initPayment(initPaymentInfo);
    return {
        paymentUrl: result.GatewayPageURL,
    };
});
const validatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload ||
        !payload.status ||
        payload.status !== "VALID" ||
        !payload.tran_id) {
        return {
            message: "Invalid payment data",
        };
    }
    const response = yield ssl_service_1.SSLServices.validatePayment(payload);
    if (response.status !== "VALID") {
        return {
            message: "Payment Failed",
        };
    }
    // const response = payload;
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatePaymentData = yield tx.payment.update({
            where: {
                transactionId: response.tran_id,
            },
            data: {
                status: client_1.PaymentStatus.PAID,
                paymentGatewayData: response,
            },
        });
        yield tx.appointment.update({
            where: {
                id: updatePaymentData.appointmentId,
            },
            data: {
                paymentStatus: client_1.PaymentStatus.PAID,
            },
        });
    }));
    return {
        message: "Payment Success",
    };
});
exports.PaymentServices = {
    initPayment,
    validatePayment,
};
