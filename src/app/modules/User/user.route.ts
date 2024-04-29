import express, { NextFunction, Request, Response } from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../helpers/fileUploader";
import validRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.post(
    "/create-admin",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    validRequest(UserValidation.createAdminValidationSchema),
    UserControllers.createAdmin
);

router.post(
    "/create-doctor",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    validRequest(UserValidation.createDoctorValidationSchema),
    UserControllers.createDoctor
);

router.post(
    "/create-patient",
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    validRequest(UserValidation.createPatientValidationSchema),
    UserControllers.createPatient
);

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    UserControllers.getAllUsers
);

router.get(
    "/me",
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    UserControllers.getMyProfile
);

router.patch(
    "/:id/status",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    UserControllers.changeProfileStatus
);

router.patch(
    "/update-my-profile",
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    // validRequest(UserValidation.updateUserValidationSchema),
    UserControllers.updateMyProfile
);

export const UserRouters = router;
