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
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("./app/helpers/prisma"));
const config_1 = __importDefault(require("./app/config"));
const superAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isSuperAdminExist = yield prisma_1.default.user.findFirst({
            where: {
                role: "SUPER_ADMIN",
            },
        });
        if (isSuperAdminExist) {
            console.log("Super Admin already exist");
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(config_1.default.super_admin_password, Number(config_1.default.salt_rounds));
        const superAdmin = yield prisma_1.default.user.create({
            data: {
                email: config_1.default.super_admin_email,
                password: hashedPassword,
                role: client_1.UserRole.SUPER_ADMIN,
                admin: {
                    create: {
                        name: "Asif Kabir Emon",
                        contactNumber: "01700000000",
                    },
                },
            },
        });
        console.log("Super Admin created successfully", superAdmin);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        yield prisma_1.default.$disconnect();
    }
});
superAdmin();
