import express from "express";
import { UserRouters } from "../modules/User/user.route";
import { AdminRouters } from "../modules/Admin/admin.route";
import { AuthRouters } from "../modules/Auth/auth.route";
import { SpecialitiesRouters } from "../modules/Specialties/specialities.route";
import { DoctorRouters } from "../modules/Doctor/doctor.route";
import { PatientRouters } from "../modules/Patient/patient.route";
import { ScheduleRouters } from "../modules/Schedule/schedule.route";
import { DoctorScheduleRouters } from "../modules/DoctorSchedule/doctorSchedule.route";
import { AppointmentRouters } from "../modules/Appointment/appointment.route";
import { PaymentRouters } from "../modules/Payment/payment.route";
import { PrescriptionRouters } from "../modules/Prescription/prescription.router";
import { ReviewRouters } from "../modules/Review/review.route";
import { MetaRouters } from "../modules/Meta/meta.route";
const router = express.Router();

const moduleRoutes = [
    {
        path: "/user",
        route: UserRouters,
    },
    {
        path: "/admin",
        route: AdminRouters,
    },
    {
        path: "/doctor",
        route: DoctorRouters,
    },
    {
        path: "/patient",
        route: PatientRouters,
    },
    {
        path: "/auth",
        route: AuthRouters,
    },
    {
        path: "/specialities",
        route: SpecialitiesRouters,
    },
    {
        path: "/schedule",
        route: ScheduleRouters,
    },
    {
        path: "/doctor-schedule",
        route: DoctorScheduleRouters,
    },
    {
        path: "/appointment",
        route: AppointmentRouters,
    },
    {
        path: "/payment",
        route: PaymentRouters,
    },
    {
        path: "/prescription",
        route: PrescriptionRouters,
    },
    {
        path: "/review",
        route: ReviewRouters,
    },
    {
        path: "/meta",
        route: MetaRouters,
    },
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
