"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = 4000;
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            server = app_1.default.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        }
        catch (error) {
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
        process.on("uncaughtException", (error) => {
            console.error("Unhandled Exception: ", error);
            exitHandler();
        });
        process.on("unhandledRejection", (error) => {
            console.error("Unhandled Rejection: ", error);
            exitHandler();
        });
    });
}
main();
