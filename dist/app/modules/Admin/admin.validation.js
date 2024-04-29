"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidation = void 0;
const zod_1 = require("zod");
const updateAdminValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        profilePhoto: zod_1.z.string().optional(),
        contactNumber: zod_1.z.string().min(8).optional(),
    }),
});
exports.AdminValidation = {
    updateAdminValidationSchema,
};
