"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/User/user.route");
const admin_route_1 = require("../modules/Admin/admin.route");
const auth_route_1 = require("../modules/Auth/auth.route");
const specialities_route_1 = require("../modules/Specialties/specialities.route");
const doctor_route_1 = require("../modules/Doctor/doctor.route");
const patient_route_1 = require("../modules/Patient/patient.route");
const schedule_route_1 = require("../modules/Schedule/schedule.route");
const doctorSchedule_route_1 = require("../modules/DoctorSchedule/doctorSchedule.route");
const appointment_route_1 = require("../modules/Appointment/appointment.route");
const payment_route_1 = require("../modules/Payment/payment.route");
const prescription_router_1 = require("../modules/Prescription/prescription.router");
const review_route_1 = require("../modules/Review/review.route");
const meta_route_1 = require("../modules/Meta/meta.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRouters,
    },
    {
        path: "/admin",
        route: admin_route_1.AdminRouters,
    },
    {
        path: "/doctor",
        route: doctor_route_1.DoctorRouters,
    },
    {
        path: "/patient",
        route: patient_route_1.PatientRouters,
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRouters,
    },
    {
        path: "/specialities",
        route: specialities_route_1.SpecialitiesRouters,
    },
    {
        path: "/schedule",
        route: schedule_route_1.ScheduleRouters,
    },
    {
        path: "/doctor-schedule",
        route: doctorSchedule_route_1.DoctorScheduleRouters,
    },
    {
        path: "/appointment",
        route: appointment_route_1.AppointmentRouters,
    },
    {
        path: "/payment",
        route: payment_route_1.PaymentRouters,
    },
    {
        path: "/prescription",
        route: prescription_router_1.PrescriptionRouters,
    },
    {
        path: "/review",
        route: review_route_1.ReviewRouters,
    },
    {
        path: "/meta",
        route: meta_route_1.MetaRouters,
    },
];
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
