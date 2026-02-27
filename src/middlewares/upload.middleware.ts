// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { Request } from "express";
// import { HttpError } from "../error/http-error";

// // ✅ uuid import for CommonJS + ts-node
// const { v4: uuidv4 } = require("uuid");

// // ✅ backend/uploads/profilepicture
// const uploadDir = path.join(process.cwd(), "uploads/profilepicture");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },

//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     cb(null, `${uuidv4()}${ext}`);
//   },
// });

// const fileFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new HttpError(400, "Only image files are allowed"));
//   }
// };

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter,
// });

// export const uploads = {
//   single: (fieldName: string) => upload.single(fieldName),
//   array: (fieldName: string, maxCount: number) =>
//     upload.array(fieldName, maxCount),
//   fields: (fieldsArray: { name: string; maxCount?: number }[]) =>
//     upload.fields(fieldsArray),

//   // ✅ IMPORTANT: parse multipart/form-data with NO file (only text fields)
//   none: () => upload.none(),
// };

import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { HttpError } from "../error/http-error";

// ✅ uuid import for CommonJS + ts-node
const { v4: uuidv4 } = require("uuid");

// ---------- helpers ----------
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ---------- shared file filter ----------
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new HttpError(400, "Only image files are allowed"));
};

// =====================================================
// ✅ 1) PROFILE PICTURE UPLOAD (YOUR EXISTING ONE)
// path: uploads/profilepicture
// =====================================================
const profileDir = path.join(process.cwd(), "uploads/profilepicture");

const profileStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    ensureDir(profileDir);
    cb(null, profileDir);
  },

  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

export const uploads = {
  single: (fieldName: string) => profileUpload.single(fieldName),
  array: (fieldName: string, maxCount: number) =>
    profileUpload.array(fieldName, maxCount),
  fields: (fieldsArray: { name: string; maxCount?: number }[]) =>
    profileUpload.fields(fieldsArray),

  // ✅ IMPORTANT: parse multipart/form-data with NO file (only text fields)
  none: () => profileUpload.none(),
};

// =====================================================
// ✅ 2) PIZZA IMAGE UPLOAD (NEW)
// path: uploads/pizzas
// =====================================================
const pizzaDir = path.join(process.cwd(), "uploads/pizzas");

const pizzaStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    ensureDir(pizzaDir);
    cb(null, pizzaDir);
  },

  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `pizza-${uuidv4()}${ext}`);
  },
});

const pizzaUpload = multer({
  storage: pizzaStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// ✅ use this in pizza routes: pizzaUploads.single("image")
export const pizzaUploads = {
  single: (fieldName: string) => pizzaUpload.single(fieldName),
};
