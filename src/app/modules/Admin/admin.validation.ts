import { z } from "zod";

const updateAdminValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        profilePhoto: z.string().optional(),
        contactNumber: z.string().min(8).optional(),
    }),
});

export const AdminValidation = {
    updateAdminValidationSchema,
};
