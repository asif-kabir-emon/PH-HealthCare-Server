import express, { Application } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import httpStatus from "http-status";
import cookieParser from "cookie-parser";
import { AppointmentServices } from "./app/modules/Appointment/appointment.service";
import cron from "node-cron";

const app: Application = express();

app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

cron.schedule("* * * * *", () => {
    try {
        AppointmentServices.cancelUnpaidAppointmentsIntoDB();
    } catch (error) {
        console.error(
            "Error in cancelUnpaidAppointmentsIntoDB cron job",
            error
        );
    }
});

app.get("/", (req, res) => {
    res.send("PH Health Care Server");
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use("*", (req, res) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Requested path not found",
        },
    });
});

export default app;
