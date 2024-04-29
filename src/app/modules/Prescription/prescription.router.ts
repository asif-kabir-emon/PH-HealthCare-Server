import express from "express";
import { PrescriptionControllers } from "./prescription.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.DOCTOR),
    PrescriptionControllers.createPrescription
);

router.get(
    "/",
    auth(UserRole.PATIENT),
    PrescriptionControllers.patientPrescription
);

export const PrescriptionRouters = router;
