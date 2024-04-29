import express from "express";
import { PaymentControllers } from "./payment.controller";

const router = express.Router();

router.post("/init-payment/:appointmentId", PaymentControllers.initPayment);

router.get("/ipn", PaymentControllers.validatePayment);

export const PaymentRouters = router;
