import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const applyPromoCode = async (req: Request, res: Response) => {
  try {
    const code = (req.body.code || "").trim().toUpperCase();
    const user = (req as any).user;

    if (!code) {
      return res.status(400).json({ error: "Promo code is required" });
    }

    // ✅ CHECK: User can only apply ONE promo code EVER
    const hasUsedPromo = await prisma.promoCodeUsage.findFirst({
      where: { userId: user.id },
    });

    if (hasUsedPromo) {
      return res.status(400).json({ 
        error: "You have already used a promo code on this account" 
      });
    }

    // Validate promo code exists and is active
    const promo = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promo || !promo.isActive) {
      return res.status(400).json({ error: "Invalid promo code" });
    }

    // Check expiry
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return res.status(400).json({ error: "This promo code has expired" });
    }

    // Check max uses
    if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
      return res.status(400).json({ error: "This promo code has reached its usage limit" });
    }

    // Apply promo code - add credits to user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: { increment: promo.credits },
      },
    });

    // Create usage record
    await prisma.promoCodeUsage.create({
      data: {
        promoCodeId: promo.id,
        userId: user.id,
        creditsAdded: promo.credits,
      },
    });

    // Increment promo code usage count
    await prisma.promoCode.update({
      where: { id: promo.id },
      data: { currentUses: { increment: 1 } },
    });

    return res.json({
      success: true,
      message: `Promo code applied! ${promo.credits.toLocaleString()} credits added.`,
      creditsAdded: promo.credits,
      totalCredits: updatedUser.credits,
    });

  } catch (err) {
    console.error("Promo apply error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

// Get user's promo code usage history
export const getPromoUsage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const usage = await prisma.promoCodeUsage.findFirst({
      where: { userId: user.id },
      include: {
        promoCode: {
          select: {
            code: true,
            credits: true,
          }
        }
      },
      orderBy: { usedAt: 'desc' }
    });

    return res.json({
      hasUsedPromo: !!usage,
      usage: usage ? {
        code: usage.promoCode.code,
        creditsAdded: usage.creditsAdded,
        usedAt: usage.usedAt,
      } : null
    });

  } catch (err) {
    console.error("Get promo usage error:", err);
    return res.status(500).json({ error: "Failed to fetch promo usage" });
  }
};