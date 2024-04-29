import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { DoctorControllers } from "./doctor.controller";

const router = express.Router();

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    DoctorControllers.getAllDoctors
);

router.get(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    DoctorControllers.getDoctorById
);

router.patch(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
    DoctorControllers.updateDoctor
);

router.delete(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    DoctorControllers.deleteDoctorById
);

export const DoctorRouters = router;
