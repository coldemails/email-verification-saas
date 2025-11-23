import express from "express";
import { authenticate } from "../middleware/auth";
import { applyPromoCode, getPromoUsage } from "../controllers/promoController";

const router = express.Router();

// Apply promo code
router.post("/apply", authenticate, applyPromoCode);

// Get user's promo usage history
router.get("/usage", authenticate, getPromoUsage);

export default router;