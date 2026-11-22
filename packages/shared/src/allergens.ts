// Approved allergen options. Used by the API (validation) and the web app (form and display).
export const ALLERGEN_OPTIONS = [
  "Peanuts",
  "Tree nuts",
  "Milk / Dairy",
  "Wheat / Gluten",
  "Soy",
  "Eggs",
  "Fish",
  "Shellfish",
  "Sesame",
  "Mustard",
  "None",
  "Unknown / Information unavailable",
] as const;

export type AllergenOption = (typeof ALLERGEN_OPTIONS)[number];

// These two options cannot be combined with any other option.
export const EXCLUSIVE_ALLERGENS: readonly AllergenOption[] = ["None", "Unknown / Information unavailable"];

export type AllergenResult = { ok: true; value: string } | { ok: false; message: string };

// Validates a submitted allergen value. Returns the options in the fixed list order, joined with ", ".
export function normaliseAllergens(input: unknown): AllergenResult {
  if (input === undefined || input === null || (typeof input === "string" && input.trim() === "")) {
    return { ok: false, message: "Select at least one allergen option." };
  }
  if (typeof input !== "string") {
    return { ok: false, message: "Allergens must be sent as text." };
  }
  const parts = input.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
  const approved = ALLERGEN_OPTIONS as readonly string[];
  const invalid = parts.filter((part) => !approved.includes(part));
  if (invalid.length > 0) {
    return { ok: false, message: "Unknown allergen option: " + invalid.join(", ") + "." };
  }
  const selected = new Set(parts);
  if (selected.size === 0) {
    return { ok: false, message: "Select at least one allergen option." };
  }
  const hasExclusive = EXCLUSIVE_ALLERGENS.some((option) => selected.has(option));
  if (hasExclusive && selected.size > 1) {
    return { ok: false, message: "None and Unknown / Information unavailable cannot be combined with other allergens." };
  }
  return { ok: true, value: ALLERGEN_OPTIONS.filter((option) => selected.has(option)).join(", ") };
}

// For display: returns the individual options if the stored text is made only of approved options, otherwise null (legacy free text).
export function parseAllergenDisplay(stored: string | null): string[] | null {
  if (!stored) return null;
  const parts = stored.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
  const approved = ALLERGEN_OPTIONS as readonly string[];
  if (parts.length === 0 || !parts.every((part) => approved.includes(part))) return null;
  return parts;
}
