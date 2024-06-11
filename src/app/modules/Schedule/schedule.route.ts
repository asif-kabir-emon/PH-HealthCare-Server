import express from "express";
import { ScheduleControllers } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/", auth(UserRole.ADMIN), ScheduleControllers.createSchedule);

router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.DOCTOR),
    ScheduleControllers.getAllSchedules
);

router.get(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    ScheduleControllers.getScheduleById
);

router.delete(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    ScheduleControllers.deleteScheduleById
);

export const ScheduleRouters = router;
