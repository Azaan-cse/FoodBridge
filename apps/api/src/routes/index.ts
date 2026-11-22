import { Router } from "express";
import { normaliseAllergens } from "@foodbridge/shared";
import prisma from "../lib/prisma";
import {
  ClaimError,
  cancelClaim,
  claimListingQuantity,
  getListingRemaining,
  validateClaimId,
  validateClaimQuantity,
} from "../lib/claims";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "FoodBridge routes are working!",
  });
});

// Database check
router.get("/db-check", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "FoodBridge database connected!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// User registration
router.post("/users", async (req, res) => {
  try {
    const { name, email, role, phone } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({
        success: false,
        message: "Name, email and role are required",
      });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        phone,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "User registration failed",
    });
  }
});

// Create food donation listing
router.post("/food-listings", async (req, res) => {
  try {
    const {
      foodName,
      quantity,
      servings,
      preparedAt,
      pickupDeadline,
      storageInfo,
      allergens,
      donorId,
    } = req.body;

    if (
      !foodName ||
      !quantity ||
      !servings ||
      !preparedAt ||
      !pickupDeadline ||
      !storageInfo ||
      !donorId
    ) {
      res.status(400).json({
        success: false,
        message: "Required food donation details are missing",
      });
      return;
    }

    if (
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) <= 0 ||
      !Number.isInteger(Number(servings)) ||
      Number(servings) <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Quantity and servings must be positive numbers",
      });
      return;
    }

    const allergenResult = normaliseAllergens(allergens);
    if (!allergenResult.ok) {
      res.status(400).json({
        success: false,
        message: allergenResult.message,
      });
      return;
    }

    const preparedDate = new Date(preparedAt);
    const deadlineDate = new Date(pickupDeadline);

    if (
      Number.isNaN(preparedDate.getTime()) ||
      Number.isNaN(deadlineDate.getTime()) ||
      deadlineDate <= preparedDate
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide valid preparation and pickup dates",
      });
      return;
    }

    const listing = await prisma.foodListing.create({
      data: {
        foodName,
        quantity: Number(quantity),
        servings: Number(servings),
        preparedAt: preparedDate,
        pickupDeadline: deadlineDate,
        storageInfo,
        allergens: allergenResult.value,
        donorId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Food donation listed successfully!",
      listing,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Food donation listing failed",
    });
  }
});

// Get available food listings for NGOs and receivers
router.get("/food-listings", async (_req, res) => {
  try {
    const listings = await prisma.foodListing.findMany({
      where: {
        status: "POSTED",
        pickupDeadline: {
          gt: new Date(),
        },
      },
      include: {
        donor: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      message: "Food listings fetched successfully!",
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch food listings",
    });
  } 
});

// Receiver view: open listings with the quantity still available to claim
router.get("/receiver/listings", async (_req, res) => {
  try {
    const listings = await prisma.foodListing.findMany({
      where: {
        status: "POSTED",
        pickupDeadline: {
          gt: new Date(),
        },
      },
      include: {
        donor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        pickupDeadline: "asc",
      },
    });

    const data = [];
    for (const listing of listings) {
      const remainingQuantity = await getListingRemaining(listing);
      if (remainingQuantity <= 0.0005) {
        continue;
      }
      data.push({
        id: listing.id,
        foodName: listing.foodName,
        quantity: listing.quantity,
        claimedQuantity: Math.round((listing.quantity - remainingQuantity) * 1000) / 1000,
        remainingQuantity,
        servings: listing.servings,
        preparedAt: listing.preparedAt,
        pickupDeadline: listing.pickupDeadline,
        storageInfo: listing.storageInfo,
        allergens: listing.allergens,
        status: listing.status,
        createdAt: listing.createdAt,
        donor: { name: listing.donor?.name ?? null },
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch receiver listings",
    });
  }
});

// Create a partial claim against a listing
router.post("/food-claims", async (req, res) => {
  try {
    const { listingId, receiverId, quantity, claimId } = req.body ?? {};

    if (typeof listingId !== "string" || listingId.trim() === "") {
      res.status(400).json({
        success: false,
        message: "listingId is required",
      });
      return;
    }

    if (typeof receiverId !== "string" || receiverId.trim() === "") {
      res.status(400).json({
        success: false,
        message: "receiverId is required",
      });
      return;
    }

    let validClaimId: string | undefined;
    if (claimId !== undefined && claimId !== null) {
      const checked = validateClaimId(claimId);
      if (checked === null) {
        res.status(400).json({
          success: false,
          message: "claimId must be a UUID",
        });
        return;
      }
      validClaimId = checked;
    }

    const listing = await prisma.foodListing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      res.status(404).json({
        success: false,
        message: "Listing not found",
      });
      return;
    }

    const remaining = await getListingRemaining(listing);
    const quantityResult = validateClaimQuantity(quantity, remaining);
    if (!quantityResult.ok) {
      res.status(400).json({
        success: false,
        message: quantityResult.message,
      });
      return;
    }

    const result = await claimListingQuantity({
      listingId,
      receiverId,
      quantity: quantityResult.quantity,
      claimId: validClaimId,
    });

    res.status(result.created ? 201 : 200).json({
      success: true,
      data: {
        claim: result.claim,
        remainingQuantity: result.remainingQuantity,
      },
    });
  } catch (error) {
    if (error instanceof ClaimError) {
      res.status(error.status).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not create claim",
    });
  }
});

// Cancel an active claim owned by the receiver
router.post("/food-claims/:id/cancel", async (req, res) => {
  try {
    const { receiverId } = req.body ?? {};

    if (typeof receiverId !== "string" || receiverId.trim() === "") {
      res.status(400).json({
        success: false,
        message: "receiverId is required",
      });
      return;
    }

    const result = await cancelClaim({
      claimId: req.params.id,
      receiverId,
    });

    res.json({
      success: true,
      data: {
        claim: result.claim,
      },
    });
  } catch (error) {
    if (error instanceof ClaimError) {
      res.status(error.status).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not create claim",
    });
  }
});

export default router;