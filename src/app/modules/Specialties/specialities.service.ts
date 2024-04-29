import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import prisma from "../../helpers/prisma";

const createSpecialtyIntoDB = async (req: Request) => {
    const file = req.file;

    if (file) {
        const uploadCloudinary = (await fileUploader.uploadToCloudinary(
            file,
            req.body.title
        )) as {
            secure_url: string;
        };
        req.body.icon = uploadCloudinary?.secure_url;
    }

    const result = await prisma.specialities.create({
        data: req.body,
    });

    return result;
};

const getAllSpecialitiesFromDB = async () => {
    const result = await prisma.specialities.findMany();

    return result;
};

const deleteSpecialtyFromDB = async (id: string) => {
    await prisma.specialities.findUniqueOrThrow({
        where: {
            id,
        },
    });

    await prisma.specialities.delete({
        where: {
            id,
        },
    });
};

export const SpecialitiesServices = {
    createSpecialtyIntoDB,
    getAllSpecialitiesFromDB,
    deleteSpecialtyFromDB,
};
