"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRouters = void 0;
const express_1 = __importDefault(require("express"));
const patient_controller_1 = require("./patient.controller");
const router = express_1.default.Router();
router.get("/", patient_controller_1.PatientControllers.getAllPatients);
router.get("/:id", patient_controller_1.PatientControllers.getPatientById);
router.delete("/:id", patient_controller_1.PatientControllers.deletePatientById);
router.patch("/:id", patient_controller_1.PatientControllers.updatePatient);
exports.PatientRouters = router;
