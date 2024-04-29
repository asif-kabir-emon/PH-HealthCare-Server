import express from "express";
import { AdminControllers } from "./admin.controller";
import { AdminValidation } from "./admin.validation";
import validRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminControllers.getAllAdmins
);

router.get(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminControllers.getAdminById
);

router.patch(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    validRequest(AdminValidation.updateAdminValidationSchema),
    AdminControllers.updateAdmin
);

router.delete(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminControllers.deleteAdmin
);

export const AdminRouters = router;
