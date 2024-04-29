import axios from "axios";
import config from "../../config";
import prisma from "../../helpers/prisma";
import { SSLServices } from "../SSL/ssl.service";
import { PaymentStatus } from "@prisma/client";
import { TPaymentData } from "../SSL/ssl.interface";

const initPayment = async (appointmentId: string) => {
    const paymentInfo = await prisma.payment.findUniqueOrThrow({
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

    const initPaymentInfo: TPaymentData = {
        amount: paymentInfo.amount,
        transactionId: paymentInfo.transactionId,
        name: paymentInfo.appointment.patient.name,
        email: paymentInfo.appointment.patient.email,
        address: paymentInfo.appointment.patient.address,
        phoneNumber: paymentInfo.appointment.patient.contactNumber,
    };

    const result = await SSLServices.initPayment(initPaymentInfo);

    return {
        paymentUrl: result.GatewayPageURL,
    };
};

const validatePayment = async (payload: any) => {
    if (
        !payload ||
        !payload.status ||
        payload.status !== "VALID" ||
        !payload.tran_id
    ) {
        return {
            message: "Invalid payment data",
        };
    }

    const response = await SSLServices.validatePayment(payload);

    if (response.status !== "VALID") {
        return {
            message: "Payment Failed",
        };
    }

    // const response = payload;

    await prisma.$transaction(async (tx) => {
        const updatePaymentData = await tx.payment.update({
            where: {
                transactionId: response.tran_id,
            },
            data: {
                status: PaymentStatus.PAID,
                paymentGatewayData: response,
            },
        });

        await tx.appointment.update({
            where: {
                id: updatePaymentData.appointmentId,
            },
            data: {
                paymentStatus: PaymentStatus.PAID,
            },
        });
    });

    return {
        message: "Payment Success",
    };
};

export const PaymentServices = {
    initPayment,
    validatePayment,
};
