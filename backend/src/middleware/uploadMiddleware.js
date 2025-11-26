// src/middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ensure upload folder exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "profile");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    // req.user should exist (protected route). Fallback to timestamp if not.
    const id = (req.user && req.user._id) ? req.user._id.toString() : Date.now().toString();
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${id}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
}

export const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
