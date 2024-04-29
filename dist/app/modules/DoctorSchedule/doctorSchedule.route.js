"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorScheduleRouters = void 0;
const express_1 = __importDefault(require("express"));
const doctorSchedule_controller_1 = require("./doctorSchedule.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.UserRole.DOCTOR), doctorSchedule_controller_1.DoctorScheduleControllers.createDoctorSchedule);
router.get("/my-schedules", (0, auth_1.default)(client_1.UserRole.DOCTOR), doctorSchedule_controller_1.DoctorScheduleControllers.getMySchedules);
router.delete("/:id", (0, auth_1.default)(client_1.UserRole.DOCTOR), doctorSchedule_controller_1.DoctorScheduleControllers.deleteDoctorSchedule);
exports.DoctorScheduleRouters = router;
