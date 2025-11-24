import express from "express";
import { parseExpenseAI } from "../controllers/aiController.js";

const router = express.Router();

router.post("/parse", parseExpenseAI);

export default router;
