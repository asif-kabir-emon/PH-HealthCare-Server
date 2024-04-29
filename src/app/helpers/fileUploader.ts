import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: "dfmm7im1o",
    api_key: "876217717238836",
    api_secret: "Ds6Ho2N_9hLEJ8x2K4jppn5BKt8",
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: any, fileName: string) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            file.path,
            { public_id: fileName },
            (error, result) => {
                fs.unlinkSync(file.path);
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

export const fileUploader = {
    upload,
    uploadToCloudinary,
};
