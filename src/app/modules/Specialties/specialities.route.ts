import express, { NextFunction, Request, Response } from "express";
import { SpecialitiesControllers } from "./specialities.controller";
import { fileUploader } from "../../helpers/fileUploader";
import validRequest from "../../middlewares/validateRequest";
import { SpecialitiesValidations } from "./specialities.validation";

const router = express.Router();

router.post(
    "/",
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    validRequest(SpecialitiesValidations.createSpecialtyValidationSchema),
    SpecialitiesControllers.createSpecialty
);

router.get("/", SpecialitiesControllers.getAllSpecialities);

router.delete("/:id", SpecialitiesControllers.deleteSpecialty);

export const SpecialitiesRouters = router;
