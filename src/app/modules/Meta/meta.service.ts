import { PaymentStatus, UserRole } from "@prisma/client";
import { IAuthUser } from "../../interfaces/common";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import prisma from "../../helpers/prisma";

const dashboardMetaDataFromDB = async (user: IAuthUser) => {
    let metaData;
    switch (user?.role) {
        case UserRole.SUPER_ADMIN:
            metaData = getSuperAdminMetaData();
            break;
        case UserRole.ADMIN:
            metaData = getAdminMetaData();
            break;
        case UserRole.DOCTOR:
            metaData = getDoctorMetaData(user as IAuthUser);
            break;
        case UserRole.PATIENT:
            metaData = getPatientMetaData(user as IAuthUser);
            break;
        default:
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid User Role");
    }

    return metaData;
};

const getSuperAdminMetaData = async () => {
    const appointment = await prisma.appointment.count();
    const adminCount = await prisma.admin.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const paymentCount = await prisma.payment.count();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: PaymentStatus.PAID,
        },
    });

    const barChartData = await getBarChartData();
    const pieChartData = await getPieChartData();

    return {
        appointment,
        patientCount,
        adminCount,
        doctorCount,
        paymentCount,
        totalRevenue: totalRevenue?._sum?.amount || 0,
        barChartData,
        pieChartData,
    };
};

const getAdminMetaData = async () => {
    const appointment = await prisma.appointment.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const paymentCount = await prisma.payment.count();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: PaymentStatus.PAID,
        },
    });

    return {
        appointment,
        patientCount,
        doctorCount,
        paymentCount,
        totalRevenue: totalRevenue?._sum?.amount || 0,
    };
};

const getDoctorMetaData = async (user: IAuthUser) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email,
        },
    });

    const appointmentCount = await prisma.appointment.count({
        where: {
            doctorId: doctorData.id,
        },
    });

    const patientCount = await prisma.appointment.groupBy({
        by: ["patientId"],
        where: {
            doctorId: doctorData.id,
        },
    });

    const reviewCount = await prisma.review.count({
        where: {
            doctorId: doctorData.id,
        },
    });

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            appointment: {
                doctorId: doctorData.id,
            },
            status: PaymentStatus.PAID,
        },
    });

    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
        where: {
            doctorId: doctorData.id,
        },
    });

    const formattedAppointmentStatusDistribution =
        appointmentStatusDistribution.map((item) => {
            return {
                status: item.status,
                count: item._count.id,
            };
        });

    return {
        appointmentCount,
        reviewCount,
        patientCount: patientCount.length,
        totalRevenue: totalRevenue?._sum?.amount || 0,
        appointmentStatusDistribution: formattedAppointmentStatusDistribution,
    };
};

const getPatientMetaData = async (user: IAuthUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email,
        },
    });

    const appointmentCount = await prisma.appointment.count({
        where: {
            patientId: patientData.id,
        },
    });

    const prescriptionCount = await prisma.prescription.count({
        where: {
            patientId: patientData.id,
        },
    });

    const reviewCount = await prisma.review.count({
        where: {
            patientId: patientData.id,
        },
    });

    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
        where: {
            patientId: patientData.id,
        },
    });

    const formattedAppointmentStatusDistribution =
        appointmentStatusDistribution.map((item) => {
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
};

const getBarChartData = async () => {
    const appointmentCountByMonth: {
        month: Date;
        count: bigint;
    }[] = await prisma.$queryRaw`
        SELECT
            DATE_TRUNC('month', "createdAt") as month,
            CAST(COUNT(*) as INTEGER) as count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC
    `;

    return appointmentCountByMonth;
};

const getPieChartData = async () => {
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
    });

    const formattedAppointmentStatusDistribution =
        appointmentStatusDistribution.map((item) => {
            return {
                status: item.status,
                count: item._count.id,
            };
        });

    return formattedAppointmentStatusDistribution;
};

export const MetaServices = {
    dashboardMetaDataFromDB,
};
