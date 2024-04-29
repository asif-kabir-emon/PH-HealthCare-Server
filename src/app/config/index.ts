import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,

    database_url: process.env.DATABASE_URL,
    salt_rounds: process.env.SALT_ROUNDS,

    super_admin_email: process.env.SUPER_ADMIN_EMAIL,
    super_admin_password: process.env.SUPER_ADMIN_PASSWORD,

    jwt: {
        access_secret: process.env.JWT_ACCESS_SECRET,
        refresh_secret: process.env.JWT_REFRESH_SECRET,
        access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
        reset_password_secret: process.env.RESET_PASSWORD_SECRET,
        reset_password_expires_in: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN,
    },

    reset_password_url: process.env.RESET_PASSWORD_LINK,

    email_sender: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        email: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
    },

    ssl: {
        storeId: process.env.STORE_ID,
        storePassword: process.env.STORE_PASSWORD,
        successUrl: process.env.SUCCESS_URL,
        cancelUrl: process.env.CANCEL_URL,
        failUrl: process.env.FAIL_URL,
        sslPaymentApi: process.env.SSL_PAYMENT_API,
        sslValidationApi: process.env.SSL_VALIDATION_API,
    },
};
