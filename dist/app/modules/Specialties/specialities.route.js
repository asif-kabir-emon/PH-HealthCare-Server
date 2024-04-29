"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialitiesRouters = void 0;
const express_1 = __importDefault(require("express"));
const specialities_controller_1 = require("./specialities.controller");
const fileUploader_1 = require("../../helpers/fileUploader");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const specialities_validation_1 = require("./specialities.validation");
const router = express_1.default.Router();
router.post("/", fileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateRequest_1.default)(specialities_validation_1.SpecialitiesValidations.createSpecialtyValidationSchema), specialities_controller_1.SpecialitiesControllers.createSpecialty);
router.get("/", specialities_controller_1.SpecialitiesControllers.getAllSpecialities);
router.delete("/:id", specialities_controller_1.SpecialitiesControllers.deleteSpecialty);
exports.SpecialitiesRouters = router;
