import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import path from "path";
import fs from "fs";
import { HttpError } from "../error/http-error";


// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "../../uploads/profile_pictures");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const fileSuffix = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `pro-pic-${fileSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new HttpError(400, "Invalid file type, only images are allowed!"));
    }
};

// Multer instance
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter
});

// Export helpers
export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};