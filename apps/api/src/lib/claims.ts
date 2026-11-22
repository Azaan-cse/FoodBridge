import { randomUUID } from "node:crypto";
import { Prisma, type FoodClaim } from "@prisma/client";
import prisma from "./prisma";

const TOLERANCE = 1e-9;
// Remaining quantities at or below this are treated as fully reserved.
const RESERVED_EPSILON = 0.0005;
const MAX_ATTEMPTS = 3;
// Delay before retry N (N = 1 for the first retry). Three attempts need two waits.
const RETRY_DELAYS_MS = [50, 100];
const CLAIM_ID_PATTERN = /^[0-9a-fA-F-]{36}$/;

// Shared shape of the prisma client and an interactive transaction client.
type Db = Pick<Prisma.TransactionClient, "foodClaim">;

export class ClaimError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ClaimError";
    this.status = status;
  }
}

export type ClaimQuantityResult =
  | { ok: true; quantity: number }
  | { ok: false; message: string };

export function validateClaimQuantity(
  value: unknown,
  remaining: number
): ClaimQuantityResult {
  let parsed: number;

  if (typeof value === "number") {
    parsed = value;
  } else if (typeof value === "string" && value.trim() !== "") {
    parsed = Number(value);
  } else {
    return { ok: false, message: "Quantity must be a positive number" };
  }

  if (!Number.isFinite(parsed)) {
    return { ok: false, message: "Quantity must be a positive number" };
  }

  if (parsed <= 0) {
    return { ok: false, message: "Quantity must be greater than zero" };
  }

  if (parsed > remaining + TOLERANCE) {
    return { ok: false, message: `Only ${remaining} remaining` };
  }

  const rounded = Math.round(parsed * 1000) / 1000;

  if (!(rounded > 0)) {
    return { ok: false, message: "Quantity must be at least 0.001" };
  }

  if (rounded > remaining + TOLERANCE) {
    return { ok: false, message: `Only ${remaining} remaining` };
  }

  return { ok: true, quantity: rounded };
}

export function computeRemaining(
  originalQuantity: number,
  reservedQuantities: number[]
): number {
  const reserved = reservedQuantities.reduce((sum, q) => sum + q, 0);
  const remaining = Math.max(0, originalQuantity - reserved);
  return Math.round(remaining * 1000) / 1000;
}

export function validateClaimId(value: unknown): string | null {
  if (typeof value === "string" && CLAIM_ID_PATTERN.test(value)) {
    return value;
  }
  return null;
}

// Sum of quantities that still count as reserved (CLAIMED or COLLECTED).
async function sumReserved(db: Db, listingId: string): Promise<number> {
  const agg = await db.foodClaim.aggregate({
    where: { listingId, status: { in: ["CLAIMED", "COLLECTED"] } },
    _sum: { quantity: true },
  });
  return agg._sum.quantity ?? 0;
}

export async function getListingRemaining(listing: {
  id: string;
  quantity: number;
}): Promise<number> {
  const reserved = await sumReserved(prisma, listing.id);
  return computeRemaining(listing.quantity, [reserved]);
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof ClaimError) {
    return false;
  }

  if (error instanceof Error && error.message) {
    if (
      error.message.includes("SQLITE_BUSY") ||
      error.message.includes("database is locked")
    ) {
      return true;
    }
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (code === "P1008" || code === "P2034") {
      return true;
    }
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ClaimListingInput = {
  listingId: string;
  receiverId: string;
  quantity: number;
  claimId?: string;
};

export type ClaimListingResult = {
  claim: FoodClaim | null;
  remainingQuantity: number;
  created: boolean;
};

async function runClaimTransaction(
  input: ClaimListingInput
): Promise<ClaimListingResult> {
  return prisma.$transaction(async (tx) => {
    if (input.claimId) {
      const existing = await tx.foodClaim.findUnique({
        where: { id: input.claimId },
      });
      if (existing) {
        if (
          existing.listingId !== input.listingId ||
          existing.receiverId !== input.receiverId
        ) {
          throw new ClaimError(409, "Claim id already used");
        }
        // Duplicate submission of a claim that already went through.
        const sameListing = await tx.foodListing.findUnique({
          where: { id: input.listingId },
        });
        const reserved = await sumReserved(tx, input.listingId);
        return {
          claim: existing,
          remainingQuantity: computeRemaining(sameListing?.quantity ?? 0, [
            reserved,
          ]),
          created: false,
        };
      }
    }

    const listing = await tx.foodListing.findUnique({
      where: { id: input.listingId },
    });
    if (!listing) {
      throw new ClaimError(404, "Listing not found");
    }

    const receiver = await tx.user.findUnique({
      where: { id: input.receiverId },
    });
    if (!receiver) {
      throw new ClaimError(404, "Receiver not found");
    }

    if (listing.status !== "POSTED") {
      throw new ClaimError(409, "Listing is not available");
    }

    if (listing.pickupDeadline <= new Date()) {
      throw new ClaimError(409, "Listing has expired");
    }

    const reservedBefore = await sumReserved(tx, listing.id);
    const remainingBefore = computeRemaining(listing.quantity, [reservedBefore]);
    if (input.quantity > remainingBefore + TOLERANCE) {
      throw new ClaimError(409, "Only " + remainingBefore + " remaining");
    }

    // Atomic guard: the availability check and the insert are one SQLite
    // statement, so a concurrent claim cannot overbook the listing.
    // Prisma stores DateTime in SQLite as integer milliseconds, so the raw
    // SQL uses epoch-ms numbers for createdAt and the deadline comparison.
    const id = input.claimId ?? randomUUID();
    const nowMs = Date.now();
    const inserted = await tx.$executeRaw`
      INSERT INTO "FoodClaim" ("id","quantity","status","createdAt","listingId","receiverId")
      SELECT ${id}, ${input.quantity}, 'CLAIMED', ${nowMs}, l."id", ${input.receiverId}
      FROM "FoodListing" l
      WHERE l."id" = ${input.listingId}
        AND l."status" = 'POSTED'
        AND l."pickupDeadline" > ${nowMs}
        AND ${input.quantity} <= ROUND(
          l."quantity" - COALESCE(
            (SELECT SUM(c."quantity") FROM "FoodClaim" c
             WHERE c."listingId" = l."id" AND c."status" IN ('CLAIMED','COLLECTED')),
            0
          ),
          6
        )
    `;

    if (inserted === 0) {
      // A concurrent claim (or status change) won the race.
      throw new ClaimError(
        409,
        "Listing no longer has enough remaining quantity"
      );
    }

    const reservedAfter = await sumReserved(tx, listing.id);
    const remainingQuantity = computeRemaining(listing.quantity, [reservedAfter]);

    if (remainingQuantity <= RESERVED_EPSILON) {
      await tx.foodListing.updateMany({
        where: { id: listing.id, status: "POSTED" },
        data: { status: "CLAIMED" },
      });
    }

    const claim = await tx.foodClaim.findUnique({ where: { id } });
    if (!claim) {
      throw new Error("Claim was written but could not be read back");
    }

    return { claim, remainingQuantity, created: true };
  });
}

export async function claimListingQuantity(
  input: ClaimListingInput
): Promise<ClaimListingResult> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await runClaimTransaction(input);
    } catch (error: unknown) {
      if (attempt >= MAX_ATTEMPTS || !isRetryableError(error)) {
        throw error;
      }
      await sleep(RETRY_DELAYS_MS[attempt - 1]);
    }
  }
}

export async function cancelClaim(input: {
  claimId: string;
  receiverId: string;
}): Promise<{ claim: FoodClaim }> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.foodClaim.findUnique({
      where: { id: input.claimId },
    });
    if (!existing) {
      throw new ClaimError(404, "Claim not found");
    }

    if (existing.receiverId !== input.receiverId) {
      throw new ClaimError(403, "Claim does not belong to this receiver");
    }

    if (existing.status === "CANCELLED") {
      return { claim: existing };
    }

    if (existing.status !== "CLAIMED") {
      throw new ClaimError(409, "Only active claims can be cancelled");
    }

    const updated = await tx.foodClaim.updateMany({
      where: { id: existing.id, status: "CLAIMED" },
      data: { status: "CANCELLED" },
    });
    if (updated.count === 0) {
      throw new ClaimError(409, "Claim state changed, retry");
    }

    const listing = await tx.foodListing.findUnique({
      where: { id: existing.listingId },
    });
    if (listing) {
      const reserved = await sumReserved(tx, listing.id);
      const remaining = computeRemaining(listing.quantity, [reserved]);
      if (listing.status === "CLAIMED" && remaining > RESERVED_EPSILON) {
        await tx.foodListing.updateMany({
          where: { id: listing.id, status: "CLAIMED" },
          data: { status: "POSTED" },
        });
      }
    }

    const claim = await tx.foodClaim.findUnique({
      where: { id: existing.id },
    });
    if (!claim) {
      throw new Error("Cancelled claim could not be read back");
    }

    return { claim };
  });
}
