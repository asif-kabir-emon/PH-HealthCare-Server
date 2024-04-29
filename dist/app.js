"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const http_status_1 = __importDefault(require("http-status"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const appointment_service_1 = require("./app/modules/Appointment/appointment.service");
const node_cron_1 = __importDefault(require("node-cron"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
node_cron_1.default.schedule("* * * * *", () => {
    try {
        appointment_service_1.AppointmentServices.cancelUnpaidAppointmentsIntoDB();
    }
    catch (error) {
        console.error("Error in cancelUnpaidAppointmentsIntoDB cron job", error);
    }
});
app.get("/", (req, res) => {
    res.send("PH Health Care Server");
});
app.use("/api/v1", routes_1.default);
app.use(globalErrorHandler_1.default);
app.use("*", (req, res) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Requested path not found",
        },
    });
});
exports.default = app;
