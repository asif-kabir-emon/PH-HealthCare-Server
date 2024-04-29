import nodemailer from "nodemailer";
import config from "../config";

const emailSender = async (payload: {
    email: string;
    subject: string;
    html: string;
}) => {
    const transporter = nodemailer.createTransport({
        host: config.email_sender.host,
        port: 587,
        secure: false,
        auth: {
            user: config.email_sender.email,
            pass: config.email_sender.password,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    const info = await transporter.sendMail({
        from: `"PH Health Care" <${config.email_sender.email}>`,
        to: payload.email,
        subject: payload.subject,
        html: payload.html,
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
};

export default emailSender;
