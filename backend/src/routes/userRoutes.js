import express from "express";
import { getProfile, updateProfile, changePassword, deleteAccount } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadProfile } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, uploadProfile.single("profileImage"), updateProfile);
router.put("/password", protect, changePassword);
router.delete("/profile", protect, deleteAccount);

export default router;