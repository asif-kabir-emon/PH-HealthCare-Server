import express from "express";
import { DoctorScheduleControllers } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.DOCTOR),
    DoctorScheduleControllers.createDoctorSchedule
);

router.get("", DoctorScheduleControllers.getDoctorSchedules);

router.get(
    "/my-schedules",
    auth(UserRole.DOCTOR),
    DoctorScheduleControllers.getMySchedules
);

router.delete(
    "/:id",
    auth(UserRole.DOCTOR),
    DoctorScheduleControllers.deleteDoctorSchedule
);

export const DoctorScheduleRouters = router;
