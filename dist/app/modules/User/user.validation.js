"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createAdminValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z
            .string({
            required_error: "Password is required",
        })
            .min(6)
            .max(100),
        admin: zod_1.z.object({
            email: zod_1.z
                .string({
                required_error: "Email is required",
            })
                .email(),
            name: zod_1.z
                .string({
                required_error: "Name is required",
            })
                .min(3)
                .max(100),
            contactNumber: zod_1.z.string({
                required_error: "Contact number is required",
            }),
        }),
    }),
});
const createDoctorValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z
            .string({
            required_error: "Password is required",
        })
            .min(6)
            .max(100),
        doctor: zod_1.z.object({
            email: zod_1.z
                .string({
                required_error: "Email is required",
            })
                .email(),
            name: zod_1.z
                .string({
                required_error: "Name is required",
            })
                .min(3)
                .max(100),
            contactNumber: zod_1.z.string({
                required_error: "Contact number is required",
            }),
            address: zod_1.z.string().optional(),
            registrationNumber: zod_1.z.string({
                required_error: "Registration number is required",
            }),
            experience: zod_1.z.number().optional(),
            gender: zod_1.z.enum([client_1.Gender.MALE, client_1.Gender.FEMALE], {
                required_error: "Gender is required",
            }),
            appointmentFee: zod_1.z.number({
                required_error: "Appointment fee is required",
            }),
            qualification: zod_1.z.string({
                required_error: "Qualification is required",
            }),
            currentWorkplace: zod_1.z.string({
                required_error: "Current workplace is required",
            }),
            designation: zod_1.z.string({
                required_error: "Designation is required",
            }),
            averageRating: zod_1.z.number().optional(),
        }),
    }),
});
const createPatientValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z
            .string({
            required_error: "Password is required",
        })
            .min(6)
            .max(100),
        patient: zod_1.z.object({
            email: zod_1.z
                .string({
                required_error: "Email is required",
            })
                .email(),
            name: zod_1.z
                .string({
                required_error: "Name is required",
            })
                .min(3)
                .max(100),
            contactNumber: zod_1.z.string({
                required_error: "Contact number is required",
            }),
            address: zod_1.z.string().optional(),
        }),
    }),
});
const changeProfileStatusValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum([client_1.UserStatus.ACTIVE, client_1.UserStatus.BLOCKED, client_1.UserStatus.DELETED], {
            required_error: "Status is required",
        }),
    }),
});
exports.UserValidation = {
    createAdminValidationSchema,
    createDoctorValidationSchema,
    createPatientValidationSchema,
    changeProfileStatusValidationSchema,
};
