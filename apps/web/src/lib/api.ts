export type Listing = {
  id: string;
  foodName: string;
  quantity: number;
  servings: number;
  preparedAt: string;
  pickupDeadline: string;
  storageInfo: string;
  allergens: string | null;
  status: string;
  createdAt: string;
  donorId: string;
  donor?: { name: string; role: string };
};

export type NewListingInput = {
  foodName: string;
  quantity: number;
  servings: number;
  preparedAt: string;
  pickupDeadline: string;
  storageInfo: string;
  allergens: string | null;
  donorId: string;
};

type ApiBody = { success?: boolean; message?: string; listings?: Listing[]; listing?: Listing };

async function request(url: string, init?: RequestInit): Promise<ApiBody> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("Cannot reach the FoodBridge API. Check that the API server is running.");
  }
  const body = (await res.json().catch(() => ({}))) as ApiBody;
  if (!res.ok || !body.success) {
    throw new Error(body.message ?? `Request failed (HTTP ${res.status}).`);
  }
  return body;
}

export async function fetchListings(): Promise<Listing[]> {
  const body = await request("/api/food-listings");
  return body.listings ?? [];
}

export async function createListing(input: NewListingInput): Promise<Listing> {
  const body = await request("/api/food-listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!body.listing) throw new Error("The API did not return the new donation.");
  return body.listing;
}


export type ReceiverListing = {
  id: string;
  foodName: string;
  quantity: number;
  claimedQuantity: number;
  remainingQuantity: number;
  servings: number;
  preparedAt: string;
  pickupDeadline: string;
  storageInfo: string;
  allergens: string | null;
  status: string;
  createdAt: string;
  donor: { name: string };
};

export type FoodClaimResult = {
  claim: { id?: unknown; quantity?: unknown; status?: unknown };
  remainingQuantity: number;
};

export type CreateFoodClaimInput = {
  listingId: string;
  receiverId: string;
  quantity: number;
  claimId: string;
};

type DataBody<T> = { success?: boolean; message?: string; data?: T };

async function requestData<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("Cannot reach the FoodBridge API. Check that the API server is running.");
  }
  const body = (await res.json().catch(() => ({}))) as DataBody<T>;
  if (!res.ok || !body.success || body.data === undefined) {
    throw new Error(body.message ?? `Request failed (HTTP ${res.status}).`);
  }
  return body.data;
}

export async function getReceiverListings(): Promise<ReceiverListing[]> {
  const data = await requestData<ReceiverListing[]>("/api/receiver/listings");
  return data ?? [];
}

export async function createFoodClaim(input: CreateFoodClaimInput): Promise<FoodClaimResult> {
  return requestData<FoodClaimResult>("/api/food-claims", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function cancelFoodClaim(
  claimId: string,
  receiverId: string,
): Promise<{ claim: FoodClaimResult["claim"] }> {
  return requestData<{ claim: FoodClaimResult["claim"] }>(
    `/api/food-claims/${encodeURIComponent(claimId)}/cancel`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId }),
    },
  );
}

