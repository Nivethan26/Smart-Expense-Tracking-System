import express from "express";
import { getCategorySummary, getMonthlySummary } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/category", protect, getCategorySummary);
router.get("/monthly", protect, getMonthlySummary);

export default router;
