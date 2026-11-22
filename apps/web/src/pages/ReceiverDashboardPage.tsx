import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFoodClaim, getReceiverListings, type ReceiverListing } from "../lib/api";
import { LeafIcon } from "../components/Icons";

const RECEIVER_KEY = "foodbridge.receiverId";
const LISTINGS_QUERY_KEY = ["receiver-listings"];

type CardState = {
  quantity: string;
  claimId: string | null;
  submitting: boolean;
  error: string | null;
};

const EMPTY_CARD: CardState = { quantity: "", claimId: null, submitting: false, error: null };

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function splitAllergens(value: string | null): string[] {
  const items = (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : ["Unknown"];
}

export default function ReceiverDashboardPage() {
  const queryClient = useQueryClient();
  const [receiverId, setReceiverId] = useState<string>(() => localStorage.getItem(RECEIVER_KEY) ?? "");
  const [cards, setCards] = useState<Record<string, CardState>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const inFlight = useRef<Set<string>>(new Set());

  const query = useQuery({ queryKey: LISTINGS_QUERY_KEY, queryFn: getReceiverListings });

  const listings: ReceiverListing[] = (query.data ?? []).filter((listing) => listing.remainingQuantity > 0);
  const trimmedReceiverId = receiverId.trim();

  function handleReceiverChange(value: string) {
    setReceiverId(value);
    const id = value.trim();
    if (id) {
      localStorage.setItem(RECEIVER_KEY, id);
    } else {
      localStorage.removeItem(RECEIVER_KEY);
    }
  }

  function updateCard(listingId: string, patch: Partial<CardState>) {
    setCards((prev) => ({ ...prev, [listingId]: { ...(prev[listingId] ?? EMPTY_CARD), ...patch } }));
  }

  function changeQuantity(listingId: string, value: string) {
    // A new quantity means a new request, so the previous claimId must not be reused.
    updateCard(listingId, { quantity: value, claimId: null, error: null });
  }

  async function claim(listing: ReceiverListing) {
    const listingId = listing.id;
    if (inFlight.current.has(listingId)) return;

    const card = cards[listingId] ?? EMPTY_CARD;
    if (!trimmedReceiverId) {
      updateCard(listingId, { error: "Enter your receiver ID to claim." });
      return;
    }

    const raw = card.quantity.trim();
    const quantity = Number(raw);
    if (!raw || !Number.isFinite(quantity) || quantity <= 0) {
      updateCard(listingId, { error: "Enter a quantity greater than 0." });
      return;
    }
    if (quantity > listing.remainingQuantity) {
      updateCard(listingId, { error: `You cannot claim more than the remaining ${listing.remainingQuantity} kg.` });
      return;
    }

    const claimId = card.claimId ?? crypto.randomUUID();
    inFlight.current.add(listingId);
    updateCard(listingId, { claimId, submitting: true, error: null });

    try {
      const result = await createFoodClaim({
        listingId,
        receiverId: trimmedReceiverId,
        quantity,
        claimId,
      });
      updateCard(listingId, { ...EMPTY_CARD });
      setNotice(`Claimed ${quantity}. Remaining: ${result.remainingQuantity}`);
      await queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY });
    } catch (err) {
      updateCard(listingId, {
        submitting: false,
        error: err instanceof Error ? err.message : "Could not submit the claim.",
      });
    } finally {
      inFlight.current.delete(listingId);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest">
              <LeafIcon className="h-5 w-5 text-lime" />
            </span>
            <span className="font-heading text-lg font-bold text-forest">FoodBridge</span>
          </Link>
          <Link
            to="/"
            className="rounded-full px-4 py-2 text-sm font-semibold text-forest hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
          >
            Back to homepage
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-heading text-3xl font-bold text-forest md:text-4xl">Receiver dashboard</h1>
        <p className="mt-2 text-slate/80">Browse available food and claim the portion you need.</p>

        <div className="mt-8 rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
          <label htmlFor="receiver-id" className="mb-2 block text-sm font-semibold text-forest">
            Receiver ID
          </label>
          <input
            id="receiver-id"
            placeholder="Paste your receiver ID"
            value={receiverId}
            onChange={(e) => handleReceiverChange(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-slate outline-none transition focus:border-leaf focus:ring-2 focus:ring-lime/60 sm:max-w-md"
          />
          <p className="mt-2 text-sm text-slate/80">
            FoodBridge does not have sign-in yet. This ID is saved on this device and used for your claims.
          </p>
          {!trimmedReceiverId && (
            <p className="mt-2 text-sm font-semibold text-amber-700">Enter your receiver ID to claim</p>
          )}
        </div>

        {notice && (
          <div role="status" className="mt-6 flex items-start justify-between gap-4 rounded-2xl bg-lime/30 p-5">
            <p className="text-sm font-semibold text-forest">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-forest hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-forest">Available food</h2>
          <p className="mt-2 text-sm text-slate/80">
            Only listings with remaining quantity appear here. Claims reduce the remaining quantity for everyone.
          </p>

          <div className="mt-6">
            {query.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="h-48 animate-pulse rounded-2xl bg-forest/5" />
                <div className="h-48 animate-pulse rounded-2xl bg-forest/5" />
                <div className="h-48 animate-pulse rounded-2xl bg-forest/5" />
              </div>
            ) : query.isError ? (
              <div role="alert" className="rounded-2xl border border-amber-500/40 bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-700">
                  {query.error instanceof Error ? query.error.message : "Could not load available food."}
                </p>
                <button
                  type="button"
                  onClick={() => query.refetch()}
                  className="mt-4 min-h-[44px] rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                >
                  Try again
                </button>
              </div>
            ) : listings.length === 0 ? (
              <p className="rounded-2xl bg-cream p-5 text-sm text-slate/80">No food available right now.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => {
                  const card = cards[listing.id] ?? EMPTY_CARD;
                  const canClaim = Boolean(trimmedReceiverId) && !card.submitting;
                  return (
                    <article key={listing.id} className="flex flex-col rounded-2xl border border-forest/10 bg-cream p-5">
                      <h3 className="font-heading font-semibold text-forest">{listing.foodName}</h3>
                      <p className="mt-1 text-sm text-slate">Donor: {listing.donor?.name ?? "Unknown"}</p>
                      <p className="mt-2 text-sm text-slate">
                        Total {listing.quantity} kg · Remaining{" "}
                        <span className="font-semibold text-forest">{listing.remainingQuantity} kg</span>
                      </p>
                      <p className="mt-1 text-sm text-slate">{listing.servings} servings</p>
                      <p className="mt-1 text-sm text-slate">Storage: {listing.storageInfo}</p>
                      <p className="mt-1 text-sm text-slate">Pickup by {formatDate(listing.pickupDeadline)}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {splitAllergens(listing.allergens).map((allergen) => (
                          <span
                            key={allergen}
                            className="rounded-full bg-lime/30 px-3 py-0.5 text-xs font-semibold text-forest"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-5">
                        <label htmlFor={`claim-qty-${listing.id}`} className="mb-2 block text-sm font-semibold text-forest">
                          Quantity to claim (kg)
                        </label>
                        <div className="flex gap-3">
                          <input
                            id={`claim-qty-${listing.id}`}
                            type="number"
                            min={0}
                            step={0.001}
                            value={card.quantity}
                            disabled={card.submitting}
                            onChange={(e) => changeQuantity(listing.id, e.target.value)}
                            className="min-w-0 flex-1 rounded-xl border border-forest/15 bg-white px-3 py-2 text-slate outline-none transition focus:border-leaf focus:ring-2 focus:ring-lime/60"
                          />
                          <button
                            type="button"
                            onClick={() => claim(listing)}
                            disabled={!canClaim}
                            className="min-h-[44px] shrink-0 rounded-full bg-leaf px-5 text-sm font-semibold text-white hover:bg-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {card.submitting ? "Claiming…" : "Claim"}
                          </button>
                        </div>
                        {card.error && (
                          <p role="alert" className="mt-2 text-sm font-semibold text-amber-700">
                            {card.error}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
