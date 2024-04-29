import { z } from "zod";

const createSpecialtyValidationSchema = z.object({
    body: z.object({
        title: z
            .string({
                required_error: "Title is required",
            })
            .min(3)
            .max(255),
    }),
});

export const SpecialitiesValidations = {
    createSpecialtyValidationSchema,
};
