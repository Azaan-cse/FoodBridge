import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { parseAllergenDisplay } from "@foodbridge/shared";
import { fetchListings, type Listing } from "../lib/api";
import { DonationForm } from "../components/DonationForm";
import { LeafIcon } from "../components/Icons";

const DONOR_KEY = "foodbridge.donorId";

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function DonorDashboardPage() {
  const [donorId, setDonorId] = useState<string>(() => localStorage.getItem(DONOR_KEY) ?? "");
  const [draftId, setDraftId] = useState<string>(donorId);

  function saveDonorId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = draftId.trim();
    if (id) {
      localStorage.setItem(DONOR_KEY, id);
    } else {
      localStorage.removeItem(DONOR_KEY);
    }
    setDonorId(id);
  }

  function clearDonorId() {
    localStorage.removeItem(DONOR_KEY);
    setDonorId("");
    setDraftId("");
  }

  const query = useQuery({ queryKey: ["food-listings"], queryFn: fetchListings });

  const mine: Listing[] = donorId
    ? (query.data ?? [])
        .filter((listing) => listing.donorId === donorId)
        .sort((a, b) => new Date(a.pickupDeadline).getTime() - new Date(b.pickupDeadline).getTime())
    : [];

  const totalServings = mine.reduce((sum, listing) => sum + listing.servings, 0);
  const now = Date.now();
  const nextDeadline = mine.find((listing) => new Date(listing.pickupDeadline).getTime() > now);
  const nextDeadlineText = nextDeadline ? formatDate(nextDeadline.pickupDeadline) : "None";

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
        <h1 className="font-heading text-3xl font-bold text-forest md:text-4xl">Donor dashboard</h1>
        <p className="mt-2 text-slate/80">Post surplus food and track the open listings you have shared.</p>

        <div className="mt-8 rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
          {donorId ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-forest">Donor ID</p>
                <code className="mt-2 inline-block break-all rounded bg-cream px-2 py-1 text-sm">{donorId}</code>
              </div>
              <button
                type="button"
                onClick={clearDonorId}
                className="min-h-[44px] self-start rounded-full border border-forest/20 px-5 text-sm font-semibold text-forest hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime sm:self-auto"
              >
                Use a different ID
              </button>
            </div>
          ) : (
            <div>
              <h2 className="font-heading text-xl font-bold text-forest">Connect your donor account</h2>
              <p className="mt-2 text-sm text-slate/80">
                Paste the donor ID returned when your account was registered. FoodBridge does not have sign-in yet, so
                this ID links your listings to you on this device.
              </p>
              <form onSubmit={saveDonorId} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label htmlFor="donor-id" className="mb-2 block text-sm font-semibold text-forest">
                    Donor ID
                  </label>
                  <input
                    id="donor-id"
                    required
                    placeholder="Paste your donor ID"
                    value={draftId}
                    onChange={(e) => setDraftId(e.target.value)}
                    className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-slate outline-none transition focus:border-leaf focus:ring-2 focus:ring-lime/60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!draftId.trim()}
                  className="min-h-[48px] rounded-full bg-leaf px-6 font-semibold text-white hover:bg-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save donor ID
                </button>
              </form>
            </div>
          )}
        </div>

        {donorId && (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate/80">Open listings</p>
                <p className="mt-2 font-heading text-2xl font-bold text-forest">{mine.length}</p>
              </div>
              <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate/80">Servings listed</p>
                <p className="mt-2 font-heading text-2xl font-bold text-forest">{totalServings}</p>
              </div>
              <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate/80">Next pickup deadline</p>
                <p className="mt-2 font-heading text-2xl font-bold text-forest">{nextDeadlineText}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
              <section className="rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-forest">Post a donation</h2>
                <div className="mt-6">
                  <DonationForm donorId={donorId} />
                </div>
              </section>

              <section className="rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-forest">Your open donations</h2>
                <p className="mt-2 text-sm text-slate/80">
                  Only open listings appear here: status Posted and pickup deadline still in the future. Claimed, expired
                  or withdrawn listings are not shown yet.
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  {query.isLoading ? (
                    <>
                      <div className="h-24 animate-pulse rounded-2xl bg-forest/5" />
                      <div className="h-24 animate-pulse rounded-2xl bg-forest/5" />
                      <div className="h-24 animate-pulse rounded-2xl bg-forest/5" />
                    </>
                  ) : query.isError ? (
                    <div role="alert" className="rounded-2xl border border-amber-500/40 bg-amber-50 p-5">
                      <p className="text-sm font-semibold text-amber-700">
                        {query.error instanceof Error ? query.error.message : "Could not load donations."}
                      </p>
                      <button
                        type="button"
                        onClick={() => query.refetch()}
                        className="mt-4 min-h-[44px] rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                      >
                        Try again
                      </button>
                    </div>
                  ) : mine.length === 0 ? (
                    <p className="rounded-2xl bg-cream p-5 text-sm text-slate/80">
                      No open donations for this donor ID yet. Post your first donation on the left.
                    </p>
                  ) : (
                    mine.map((listing) => (
                      <article key={listing.id} className="rounded-2xl border border-forest/10 bg-cream p-5">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-heading font-semibold text-forest">{listing.foodName}</h3>
                          <span className="shrink-0 rounded-full bg-lime/30 px-3 py-1 text-xs font-semibold text-forest">
                            Posted
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate">
                          {listing.quantity} kg · {listing.servings} servings
                        </p>
                        <p className="mt-1 text-sm text-slate">Pickup by {formatDate(listing.pickupDeadline)}</p>
                        <p className="mt-1 text-sm text-slate">Storage: {listing.storageInfo}</p>
                        <div className="mt-1 text-sm text-slate">
                          Allergens:{" "}
                          {(() => {
                            const recognised = parseAllergenDisplay(listing.allergens ?? null);
                            if (!recognised) return listing.allergens ?? "none listed";
                            return (
                              <span className="inline-flex flex-wrap gap-2 align-middle">
                                {recognised.map((allergen) => (
                                  <span
                                    key={allergen}
                                    className="rounded-full bg-lime/30 px-3 py-0.5 text-xs font-semibold text-forest"
                                  >
                                    {allergen}
                                  </span>
                                ))}
                              </span>
                            );
                          })()}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
