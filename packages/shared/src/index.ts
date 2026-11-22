// Shared constants for FoodBridge apps.
export const ROLES = ["DONOR", "RECEIVER", "VOLUNTEER", "ADMIN"] as const;
export const LISTING_STATUSES = ["POSTED", "CLAIMED", "COLLECTED", "DELIVERED", "EXPIRED", "WITHDRAWN"] as const;
export const DISCLAIMER = "Information is entered by the food donor. FoodBridge does not verify or certify food safety.";
export * from "./allergens";
