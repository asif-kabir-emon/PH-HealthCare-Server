import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import prisma from "./app/helpers/prisma";
import config from "./app/config";

const superAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findFirst({
            where: {
                role: "SUPER_ADMIN",
            },
        });

        if (isSuperAdminExist) {
            console.log("Super Admin already exist");
            return;
        }

        const hashedPassword: string = await bcrypt.hash(
            config.super_admin_password as string,
            Number(config.salt_rounds)
        );

        const superAdmin = await prisma.user.create({
            data: {
                email: config.super_admin_email as string,
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                admin: {
                    create: {
                        name: "Asif Kabir Emon",
                        contactNumber: "01700000000",
                    },
                },
            },
        });

        console.log("Super Admin created successfully", superAdmin);
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
};

superAdmin();
