"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRouters = void 0;
const express_1 = __importDefault(require("express"));
const appointment_controller_1 = require("./appointment.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const appointment_validation_1 = require("./appointment.validation");
const router = express_1.default.Router();
router.get("/", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), appointment_controller_1.AppointmentControllers.getAllAppointments);
router.get("/my-appointment", (0, auth_1.default)(client_1.UserRole.PATIENT, client_1.UserRole.DOCTOR), appointment_controller_1.AppointmentControllers.getMyAppointments);
router.post("/", (0, auth_1.default)(client_1.UserRole.PATIENT), (0, validateRequest_1.default)(appointment_validation_1.AppointmentValidations.createAppointmentValidationSchema), appointment_controller_1.AppointmentControllers.createAppointment);
router.patch("/status/:id", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR), (0, validateRequest_1.default)(appointment_validation_1.AppointmentValidations.changeAppointmentStatusValidationSchema), appointment_controller_1.AppointmentControllers.changeAppointmentStatus);
exports.AppointmentRouters = router;
