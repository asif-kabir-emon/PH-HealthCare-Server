import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

const createAppointmentValidationSchema = z.object({
    body: z.object({
        doctorId: z.string({
            required_error: "Doctor id is required",
        }),
        scheduleId: z.string({
            required_error: "Schedule id is required",
        }),
    }),
});

const changeAppointmentStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum(
            [
                AppointmentStatus.SCHEDULED,
                AppointmentStatus.INPROGRESS,
                AppointmentStatus.COMPLETED,
                AppointmentStatus.CANCELLED,
            ],
            {
                required_error: "Status is required",
            }
        ),
    }),
});

export const AppointmentValidations = {
    createAppointmentValidationSchema,
    changeAppointmentStatusValidationSchema,
};
