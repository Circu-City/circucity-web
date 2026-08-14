import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const profileSchema = z.object({
  legalName: z.string().trim().max(160).optional().default(""),
  organizationNumber: z.string().trim().max(30).optional().default(""),
  website: z.union([z.string().trim().url(), z.literal("")]).optional().default(""),
  address: z.string().trim().max(180).optional().default(""),
  postalCode: z.string().trim().max(20).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  categoryFocus: z.array(z.string().trim().min(1).max(60)).max(3).optional().default([]),
  returnPolicy: z.string().trim().max(5000).optional().default(""),
});

async function getOwnedShop(userId: string) {
  return prisma.shop.findUnique({
    where: { ownerId: userId },
    include: {
      _count: {
        select: {
          products: {
            where: { status: "ACTIVE", moderationStatus: "APPROVED" },
          },
          followers: true,
        },
      },
    },
  });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shop = await getOwnedShop(userId);
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  return NextResponse.json({
    ...shop,
    liveListingCount: shop._count.products,
    followerCount: shop._count.followers,
  });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid profile" }, { status: 400 });
  }

  const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const profileChanged = [
    [shop.legalName || "", parsed.data.legalName],
    [shop.organizationNumber || "", parsed.data.organizationNumber],
    [shop.address || "", parsed.data.address],
    [shop.postalCode || "", parsed.data.postalCode],
    [shop.city || "", parsed.data.city],
    [shop.returnPolicy || "", parsed.data.returnPolicy],
  ].some(([current, next]) => current !== next);

  const resetVerification = profileChanged && ["SUBMITTED", "UNDER_REVIEW", "VERIFIED"].includes(shop.verificationStatus);
  const updated = await prisma.shop.update({
    where: { id: shop.id },
    data: {
      legalName: parsed.data.legalName || null,
      organizationNumber: parsed.data.organizationNumber || null,
      website: parsed.data.website || null,
      address: parsed.data.address || null,
      postalCode: parsed.data.postalCode || null,
      city: parsed.data.city || null,
      categoryFocus: parsed.data.categoryFocus,
      returnPolicy: parsed.data.returnPolicy || null,
      ...(resetVerification
        ? {
            verified: false,
            verifiedAt: null,
            verificationStatus: "DRAFT" as const,
            verificationMethod: null,
            verificationReviewedAt: null,
            verificationReviewedBy: null,
            businessRegistrationVerified: false,
            addressVerified: false,
            managerIdentityVerified: false,
            returnPolicyApproved: false,
          }
        : shop.verificationStatus === "NOT_STARTED"
          ? { verificationStatus: "DRAFT" as const }
          : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shop = await getOwnedShop(userId);
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  if (shop.sellerType !== "BUSINESS") {
    return NextResponse.json({ error: "Verified Partner profiles are currently available to registered businesses and charities." }, { status: 400 });
  }
  if (["SUBMITTED", "UNDER_REVIEW", "VERIFIED"].includes(shop.verificationStatus)) {
    return NextResponse.json({ error: "This verification application has already been submitted." }, { status: 409 });
  }

  const missing: string[] = [];
  if (!shop.legalName) missing.push("legal business name");
  if (!shop.organizationNumber) missing.push("organisation number");
  if (!shop.address || !shop.city || !shop.postalCode) missing.push("physical store address");
  if (!shop.returnPolicy) missing.push("return policy");
  if (shop._count.products < 5) missing.push("five approved live listings");
  if (missing.length) {
    return NextResponse.json({ error: `Complete: ${missing.join(", ")}.` }, { status: 400 });
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.shop.update({
      where: { id: shop.id },
      data: {
        verified: false,
        verifiedAt: null,
        verificationStatus: "SUBMITTED",
        verificationSubmittedAt: now,
        verificationReviewedAt: null,
        verificationReviewedBy: null,
        verificationRejectionReason: null,
      },
    });
    await tx.auditLog.create({
      data: {
        action: "VERIFICATION_SUBMITTED",
        entity: "Shop",
        entityId: shop.id,
        performedBy: userId,
      },
    });
    return result;
  });

  return NextResponse.json(updated);
}
