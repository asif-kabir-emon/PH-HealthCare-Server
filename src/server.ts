import { Server } from "http";
import app from "./app";

const PORT = 4000;
let server: Server;

async function main() {
    try {
        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }

    const exitHandler = () => {
        if (server) {
            server.close(() => {
                console.info("Server closed");
            });
        }

        process.exit(1);
    };

    process.on("uncaughtException", (error: Error) => {
        console.error("Unhandled Exception: ", error);
        exitHandler();
    });

    process.on("unhandledRejection", (error: Error) => {
        console.error("Unhandled Rejection: ", error);
        exitHandler();
    });
}

main();
