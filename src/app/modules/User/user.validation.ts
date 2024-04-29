import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

const createAdminValidationSchema = z.object({
    body: z.object({
        password: z
            .string({
                required_error: "Password is required",
            })
            .min(6)
            .max(100),
        admin: z.object({
            email: z
                .string({
                    required_error: "Email is required",
                })
                .email(),
            name: z
                .string({
                    required_error: "Name is required",
                })
                .min(3)
                .max(100),
            contactNumber: z.string({
                required_error: "Contact number is required",
            }),
        }),
    }),
});

const createDoctorValidationSchema = z.object({
    body: z.object({
        password: z
            .string({
                required_error: "Password is required",
            })
            .min(6)
            .max(100),
        doctor: z.object({
            email: z
                .string({
                    required_error: "Email is required",
                })
                .email(),
            name: z
                .string({
                    required_error: "Name is required",
                })
                .min(3)
                .max(100),
            contactNumber: z.string({
                required_error: "Contact number is required",
            }),
            address: z.string().optional(),
            registrationNumber: z.string({
                required_error: "Registration number is required",
            }),
            experience: z.number().optional(),
            gender: z.enum([Gender.MALE, Gender.FEMALE], {
                required_error: "Gender is required",
            }),
            appointmentFee: z.number({
                required_error: "Appointment fee is required",
            }),
            qualification: z.string({
                required_error: "Qualification is required",
            }),
            currentWorkplace: z.string({
                required_error: "Current workplace is required",
            }),
            designation: z.string({
                required_error: "Designation is required",
            }),
            averageRating: z.number().optional(),
        }),
    }),
});

const createPatientValidationSchema = z.object({
    body: z.object({
        password: z
            .string({
                required_error: "Password is required",
            })
            .min(6)
            .max(100),
        patient: z.object({
            email: z
                .string({
                    required_error: "Email is required",
                })
                .email(),
            name: z
                .string({
                    required_error: "Name is required",
                })
                .min(3)
                .max(100),
            contactNumber: z.string({
                required_error: "Contact number is required",
            }),
            address: z.string().optional(),
        }),
    }),
});

const changeProfileStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum(
            [UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED],
            {
                required_error: "Status is required",
            }
        ),
    }),
});

export const UserValidation = {
    createAdminValidationSchema,
    createDoctorValidationSchema,
    createPatientValidationSchema,
    changeProfileStatusValidationSchema,
};
