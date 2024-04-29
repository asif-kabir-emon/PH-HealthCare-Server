import express from "express";
import { PatientControllers } from "./patient.controller";

const router = express.Router();

router.get("/", PatientControllers.getAllPatients);

router.get("/:id", PatientControllers.getPatientById);

router.delete("/:id", PatientControllers.deletePatientById);

router.patch("/:id", PatientControllers.updatePatient);

export const PatientRouters = router;
