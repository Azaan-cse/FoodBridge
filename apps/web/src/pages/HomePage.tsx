import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  HeartHandIcon,
  LeafIcon,
  MapPinIcon,
  MenuIcon,
  ShieldCheckIcon,
  TruckIcon,
  UtensilsIcon,
} from "../components/Icons";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Mission", href: "#mission" },
  { label: "Impact", href: "#impact" },
];

const steps = [
  {
    title: "Post surplus",
    body: "Donors list servings, preparation time, storage conditions and allergens in under two minutes.",
    Icon: UtensilsIcon,
  },
  {
    title: "Get matched",
    body: "Receivers see nearby food ranked by distance, quantity needed and pickup deadline.",
    Icon: MapPinIcon,
  },
  {
    title: "Claim your share",
    body: "Claim only the portion you can use. Quantities are reserved so no two claims overlap.",
    Icon: CheckIcon,
  },
  {
    title: "Deliver & confirm",
    body: "A volunteer collects and delivers. Each step is tracked: Posted, Claimed, Collected, Delivered.",
    Icon: TruckIcon,
  },
];

const exampleListings = [
  {
    title: "Cooked rice & dal",
    meta: "40 servings · Pickup in 3 h",
    Icon: UtensilsIcon,
    progress: true,
  },
  {
    title: "Fresh bread",
    meta: "25 kg · Pickup in 5 h",
    Icon: LeafIcon,
    progress: false,
  },
  {
    title: "Vegetable biryani",
    meta: "18 servings · Pickup in 2 h",
    Icon: HeartHandIcon,
    progress: false,
  },
];

const values = [
  {
    text: "Honest by design: we never claim food is certified safe; donors enter their own information",
    Icon: ShieldCheckIcon,
  },
  {
    text: "Built for dignity: receivers choose what they can use",
    Icon: HeartHandIcon,
  },
  {
    text: "Less waste: every shared portion is food that was not thrown away",
    Icon: LeafIcon,
  },
];

const impactStats = [
  {
    label: "Meals delivered",
    note: "Counted from confirmed deliveries only",
  },
  {
    label: "Food waste avoided",
    note: "Estimated: 1 serving = 0.4 kg (assumption)",
  },
  { label: "Active donors", note: "Placeholder until real data exists" },
  { label: "Partner receivers", note: "Placeholder until real data exists" },
];

const assumptions = [
  "1 serving = 1 meal (assumption A1)",
  "1 serving = 0.4 kg of food waste avoided (assumption A2)",
  "Only deliveries with status Delivered are counted",
  "Estimates are for demonstration; no tax, legal or financial benefit is claimed.",
];

function BrandMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest">
      <LeafIcon className="h-5 w-5 text-lime" />
    </span>
  );
}

export default function HomePage() {
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="#top"
            className={`flex items-center gap-3 rounded-lg ${focusRing}`}
          >
            <BrandMark />
            <span className="font-heading text-xl font-bold text-forest">
              FoodBridge
            </span>
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`rounded text-sm font-medium text-slate transition-colors hover:text-leaf ${focusRing}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/donor"
              className={`inline-flex min-h-[44px] items-center rounded-full bg-leaf px-5 text-sm font-semibold text-white transition hover:bg-forest ${focusRing}`}
            >
              Donate food
            </Link>
            <Link
              to="/receiver"
              className={`inline-flex min-h-[44px] items-center rounded-full px-3 text-sm font-semibold text-forest transition hover:bg-forest/5 ${focusRing}`}
            >
              Receiver dashboard
            </Link>
            <a
              href="#receiver"
              className={`inline-flex min-h-[44px] items-center rounded-full border border-forest px-5 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white ${focusRing}`}
            >
              Receive food
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={`flex h-11 w-11 items-center justify-center rounded-full text-forest transition hover:bg-forest/5 md:hidden ${focusRing}`}
          >
            {menuOpen ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="border-t border-forest/10 bg-cream md:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto max-w-6xl px-6 py-6">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={closeMenu}
                      className={`block rounded-lg px-3 py-3 text-base font-medium text-slate hover:bg-forest/5 ${focusRing}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  to="/donor"
                  onClick={closeMenu}
                  className={`inline-flex min-h-[48px] items-center justify-center rounded-full bg-leaf px-5 font-semibold text-white ${focusRing}`}
                >
                  Donate food
                </Link>
                <a
                  href="#receiver"
                  onClick={closeMenu}
                  className={`inline-flex min-h-[48px] items-center justify-center rounded-full border border-forest px-5 font-semibold text-forest ${focusRing}`}
                >
                  Receive food
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section
          id="top"
          className="relative scroll-mt-24 overflow-hidden bg-gradient-to-br from-forest to-[#145a43] py-20 md:py-28"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-lime/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-lime/10 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-lime"
                />
                ACE Builders Hackathon 2026
              </span>

              <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                From Surplus to <span className="text-lime">Smiles</span>
              </h1>

              <p className="mt-6 text-lg text-white/80">
                FoodBridge connects restaurants, caterers, canteens and marriage
                halls that have surplus edible food with NGOs, shelters and
                community kitchens that need it, before it spoils.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/donor"
                  className={`inline-flex min-h-[48px] items-center justify-center rounded-full bg-lime px-7 font-semibold text-forest transition hover:brightness-110 ${focusRing} focus-visible:ring-offset-2 focus-visible:ring-offset-forest`}
                >
                  I have surplus food
                </Link>
                <a
                  href="#receiver"
                  className={`inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/30 px-7 font-semibold text-white transition hover:bg-white/10 ${focusRing} focus-visible:ring-offset-2 focus-visible:ring-offset-forest`}
                >
                  I need food for my community
                </a>
              </div>

              <p className="mt-6 text-sm text-white/70">
                Synthetic demo data only. FoodBridge does not certify food
                safety.
              </p>
            </div>

            <div className="relative">
              <motion.div
                className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-lime">
                  Example listings (synthetic)
                </p>
                <ul className="mt-5 space-y-3">
                  {exampleListings.map((item, index) => (
                    <motion.li
                      key={item.title}
                      className="rounded-2xl bg-white/10 p-4"
                      initial={reduce ? false : { opacity: 0, y: 20 }}
                      animate={reduce ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime/20 text-lime">
                          <item.Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            {item.title}
                          </p>
                          <p className="text-sm text-white/70">{item.meta}</p>
                        </div>
                      </div>
                      {item.progress && (
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                          <div
                            className="h-full rounded-full bg-lime"
                            style={{ width: "60%" }}
                          />
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-cream py-24"
        >
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf">
              How it works
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-forest md:text-4xl">
              Four steps from kitchen to community
            </h2>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="relative rounded-2xl border border-forest/5 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <span className="absolute right-5 top-5 font-heading text-sm font-bold text-lime">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf/10 text-leaf">
                    <step.Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-heading text-lg font-bold text-forest">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {step.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Donor and receiver entry */}
        <section className="bg-cream py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-2">
            <div
              id="donor"
              className="scroll-mt-24 flex flex-col rounded-3xl bg-forest p-8 text-white shadow-lg md:p-10"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/20 text-lime">
                <UtensilsIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-6 font-heading text-2xl font-bold md:text-3xl">
                For donors
              </h2>
              <p className="mt-2 text-white/80">
                Restaurants, caterers, canteens, marriage halls and hostels.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "List surplus food in minutes",
                  "Share safety information you enter yourself",
                  "See what was collected and delivered",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-lime" />
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/donor"
                  className={`inline-flex min-h-[48px] items-center gap-2 rounded-full bg-lime px-7 font-semibold text-forest transition hover:brightness-110 ${focusRing} focus-visible:ring-offset-2 focus-visible:ring-offset-forest`}
                >
                  Post surplus food
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <p className="mt-3 text-sm text-white/70">
                  Sign-up opens in the next release. This demo shows the flow
                  only.
                </p>
              </div>
            </div>

            <div
              id="receiver"
              className="scroll-mt-24 flex flex-col rounded-3xl border border-forest/10 bg-white p-8 text-slate shadow-lg md:p-10"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
                <HeartHandIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-6 font-heading text-2xl font-bold text-forest md:text-3xl">
                For receivers
              </h2>
              <p className="mt-2 text-slate/80">
                NGOs, shelters and community kitchens.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "See available food ranked for your needs",
                  "Claim partial quantities without overlap",
                  "Track every delivery to completion",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href="#receiver"
                  className={`inline-flex min-h-[48px] items-center gap-2 rounded-full bg-leaf px-7 font-semibold text-white transition hover:bg-forest ${focusRing} focus-visible:ring-offset-2 focus-visible:ring-offset-cream`}
                >
                  Find food near me
                  <MapPinIcon className="h-5 w-5" />
                </a>
                <p className="mt-3 text-sm text-slate/70">
                  Sign-up opens in the next release. This demo shows the flow
                  only.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section
          id="mission"
          className="scroll-mt-24 bg-white py-24"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-leaf">
                Our mission
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-forest md:text-4xl">
                Food should feed people, not landfills.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate">
                Across cities, good food is thrown away while nearby shelters
                and kitchens struggle to feed people. FoodBridge is a
                coordination layer: it makes surplus visible early enough to be
                shared, and it keeps every step accountable.
              </p>
              <ul className="mt-8 space-y-5">
                {values.map(({ text, Icon }) => (
                  <li key={text} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf/10 text-leaf">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="pt-1.5 text-slate">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-leaf to-forest p-10 text-white shadow-xl md:p-14">
              <p className="font-heading text-2xl font-bold leading-snug md:text-3xl">
                &ldquo;The best food to rescue is the food that is still on the
                table.&rdquo;
              </p>
              <p className="mt-8 text-sm text-white/70">
                Mission statement, FoodBridge team.
              </p>
            </div>
          </div>
        </section>

        {/* Impact */}
        <section
          id="impact"
          className="scroll-mt-24 bg-cream py-24"
        >
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf">
              Impact
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-forest md:text-4xl">
              What confirmed deliveries will measure
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate">
              Impact figures count only deliveries marked Delivered. The numbers
              below are illustrative placeholders, not real results.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {impactStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-forest/5 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-slate">
                    {stat.label}
                  </p>
                  <p className="mt-4 font-heading text-4xl font-bold text-forest">
                    &mdash;
                  </p>
                  <p className="mt-3 text-sm text-slate/80">{stat.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-forest/10 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf/10 text-leaf">
                  <ChartIcon className="h-5 w-5" />
                </span>
                <h3 className="font-heading text-lg font-bold text-forest">
                  Assumptions behind impact estimates
                </h3>
              </div>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {assumptions.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
                    <span className="text-slate">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-forest py-10 text-white/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3 md:items-start">
          <div className="flex items-center gap-3">
            <BrandMark />
            <p className="font-heading text-base font-bold text-white">
              FoodBridge &ndash; From Surplus to Smiles
            </p>
          </div>

          <nav aria-label="Footer" className="md:justify-self-center">
            <ul className="flex flex-wrap gap-6 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`rounded transition-colors hover:text-lime ${focusRing}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-sm md:text-right">
            <p>ACE Builders Hackathon 2026 &middot; Synthetic demo data only.</p>
            <p className="mt-2">
              FoodBridge does not verify or certify food safety.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
