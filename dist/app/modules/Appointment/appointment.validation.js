"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentValidations = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createAppointmentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        doctorId: zod_1.z.string({
            required_error: "Doctor id is required",
        }),
        scheduleId: zod_1.z.string({
            required_error: "Schedule id is required",
        }),
    }),
});
const changeAppointmentStatusValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum([
            client_1.AppointmentStatus.SCHEDULED,
            client_1.AppointmentStatus.INPROGRESS,
            client_1.AppointmentStatus.COMPLETED,
            client_1.AppointmentStatus.CANCELLED,
        ], {
            required_error: "Status is required",
        }),
    }),
});
exports.AppointmentValidations = {
    createAppointmentValidationSchema,
    changeAppointmentStatusValidationSchema,
};
