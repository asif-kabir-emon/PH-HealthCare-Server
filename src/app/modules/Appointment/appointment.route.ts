import express from "express";
import { AppointmentControllers } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validRequest from "../../middlewares/validateRequest";
import { AppointmentValidations } from "./appointment.validation";

const router = express.Router();

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AppointmentControllers.getAllAppointments
);

router.get(
    "/my-appointment",
    auth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentControllers.getMyAppointments
);

router.post(
    "/",
    auth(UserRole.PATIENT),
    validRequest(AppointmentValidations.createAppointmentValidationSchema),
    AppointmentControllers.createAppointment
);

router.patch(
    "/status/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
    validRequest(
        AppointmentValidations.changeAppointmentStatusValidationSchema
    ),
    AppointmentControllers.changeAppointmentStatus
);

export const AppointmentRouters = router;
