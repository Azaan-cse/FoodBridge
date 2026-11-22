import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createListing, type NewListingInput } from "../lib/api";
import { ALLERGEN_OPTIONS, EXCLUSIVE_ALLERGENS, type AllergenOption } from "@foodbridge/shared";

type FormState = {
  foodName: string;
  quantity: string;
  servings: string;
  preparedAt: string;
  pickupDeadline: string;
  storageInfo: string;
  allergens: AllergenOption[];
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  foodName: "",
  quantity: "",
  servings: "",
  preparedAt: "",
  pickupDeadline: "",
  storageInfo: "",
  allergens: [],
};

const STORAGE_OPTIONS = ["Ambient", "Chilled", "Frozen", "Hot-held"];

function validate(form: FormState, now: Date): FormErrors {
  const errors: FormErrors = {};

  const foodName = form.foodName.trim();
  if (!foodName) {
    errors.foodName = "Enter the food name.";
  } else if (foodName.length > 120) {
    errors.foodName = "Keep the name under 120 characters.";
  }

  const quantityText = form.quantity.trim();
  const quantity = Number(quantityText);
  if (!quantityText || !Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = "Enter a quantity greater than 0 kg.";
  }

  const servingsText = form.servings.trim();
  const servings = Number(servingsText);
  if (!servingsText || !Number.isInteger(servings) || servings < 1) {
    errors.servings = "Enter a whole number of servings, at least 1.";
  }

  if (!form.preparedAt) {
    errors.preparedAt = "Enter when the food was prepared.";
  } else if (new Date(form.preparedAt) > now) {
    errors.preparedAt = "Preparation time cannot be in the future.";
  }

  if (!form.pickupDeadline) {
    errors.pickupDeadline = "Enter the pickup deadline.";
  } else {
    const deadline = new Date(form.pickupDeadline);
    if (deadline <= now) {
      errors.pickupDeadline = "The pickup deadline must be in the future.";
    } else if (form.preparedAt && deadline <= new Date(form.preparedAt)) {
      errors.pickupDeadline = "The pickup deadline must be after preparation.";
    }
  }

  if (!form.storageInfo) {
    errors.storageInfo = "Choose the storage condition.";
  }

  if (form.allergens.length === 0) {
    errors.allergens = "Select at least one allergen option, or None / Unknown.";
  }

  return errors;
}

type FieldProps = {
  id: keyof FormState;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

function Field({ id, label, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-forest">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-amber-700">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(error?: string) {
  return [
    "w-full rounded-xl bg-white px-4 py-3 text-slate outline-none transition focus:border-leaf focus:ring-2 focus:ring-lime/60",
    error ? "border border-amber-500" : "border border-forest/15",
  ].join(" ");
}

export function DonationForm({ donorId }: { donorId: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [summary, setSummary] = useState("");

  const mutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      setForm(EMPTY);
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ["food-listings"] });
    },
  });

  function update(key: Exclude<keyof FormState, "allergens">, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // None and Unknown are exclusive with each other and with every specific allergen.
  function toggleAllergen(option: AllergenOption, checked: boolean) {
    setForm((prev) => {
      const selected = new Set<AllergenOption>(prev.allergens);
      if (!checked) {
        selected.delete(option);
      } else if (EXCLUSIVE_ALLERGENS.includes(option)) {
        selected.clear();
        selected.add(option);
      } else {
        EXCLUSIVE_ALLERGENS.forEach((exclusive) => selected.delete(exclusive));
        selected.add(option);
      }
      return { ...prev, allergens: ALLERGEN_OPTIONS.filter((item) => selected.has(item)) };
    });
    setErrors((prev) => {
      if (!prev.allergens) return prev;
      const next = { ...prev };
      delete next.allergens;
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;

    const found = validate(form, new Date());
    setErrors(found);
    const invalidFields = Object.keys(found) as (keyof FormState)[];
    if (invalidFields.length > 0) {
      setSummary(`Please fix ${invalidFields.length} field${invalidFields.length > 1 ? "s" : ""} before publishing.`);
      document.getElementById(invalidFields[0] === "allergens" ? "allergen-0" : invalidFields[0])?.focus();
      return;
    }
    setSummary("");

    const input: NewListingInput = {
      foodName: form.foodName.trim(),
      quantity: Number(form.quantity),
      servings: Number(form.servings),
      preparedAt: new Date(form.preparedAt).toISOString(),
      pickupDeadline: new Date(form.pickupDeadline).toISOString(),
      storageInfo: form.storageInfo,
      allergens: form.allergens.join(", "),
      donorId,
    };
    mutation.mutate(input);
  }

  return (
    <div>
      <p className="mb-6 text-sm text-slate/80">
        Times use your local time zone. Record both kg and servings; servings drive matching later.
      </p>

      <form noValidate onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
        <Field id="foodName" label="Food name" error={errors.foodName} className="sm:col-span-2">
          <input
            id="foodName"
            type="text"
            maxLength={120}
            value={form.foodName}
            onChange={(e) => update("foodName", e.target.value)}
            aria-invalid={errors.foodName ? true : undefined}
            aria-describedby={errors.foodName ? "foodName-error" : undefined}
            className={inputClass(errors.foodName)}
          />
        </Field>

        <Field id="quantity" label="Quantity (kg)" error={errors.quantity}>
          <input
            id="quantity"
            type="number"
            step="0.1"
            min="0"
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            aria-invalid={errors.quantity ? true : undefined}
            aria-describedby={errors.quantity ? "quantity-error" : undefined}
            className={inputClass(errors.quantity)}
          />
        </Field>

        <Field id="servings" label="Number of servings" error={errors.servings}>
          <input
            id="servings"
            type="number"
            step="1"
            min="1"
            value={form.servings}
            onChange={(e) => update("servings", e.target.value)}
            aria-invalid={errors.servings ? true : undefined}
            aria-describedby={errors.servings ? "servings-error" : undefined}
            className={inputClass(errors.servings)}
          />
        </Field>

        <Field id="preparedAt" label="Prepared on" error={errors.preparedAt}>
          <input
            id="preparedAt"
            type="datetime-local"
            value={form.preparedAt}
            onChange={(e) => update("preparedAt", e.target.value)}
            aria-invalid={errors.preparedAt ? true : undefined}
            aria-describedby={errors.preparedAt ? "preparedAt-error" : undefined}
            className={inputClass(errors.preparedAt)}
          />
        </Field>

        <Field id="pickupDeadline" label="Pickup deadline" error={errors.pickupDeadline}>
          <input
            id="pickupDeadline"
            type="datetime-local"
            value={form.pickupDeadline}
            onChange={(e) => update("pickupDeadline", e.target.value)}
            aria-invalid={errors.pickupDeadline ? true : undefined}
            aria-describedby={errors.pickupDeadline ? "pickupDeadline-error" : undefined}
            className={inputClass(errors.pickupDeadline)}
          />
        </Field>

        <Field id="storageInfo" label="Storage condition" error={errors.storageInfo}>
          <select
            id="storageInfo"
            value={form.storageInfo}
            onChange={(e) => update("storageInfo", e.target.value)}
            aria-invalid={errors.storageInfo ? true : undefined}
            aria-describedby={errors.storageInfo ? "storageInfo-error" : undefined}
            className={inputClass(errors.storageInfo)}
          >
            <option value="">Choose a storage condition</option>
            {STORAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 block text-sm font-semibold text-forest">Allergens</legend>
          <p className="mb-3 text-xs text-slate/80">
            Select every allergen present. None and Unknown cannot be combined with other options.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALLERGEN_OPTIONS.map((option, index) => (
              <label
                key={option}
                className="flex min-h-[44px] items-center gap-3 rounded-xl border border-forest/15 bg-white px-4 py-2 text-sm text-slate"
              >
                <input
                  id={`allergen-${index}`}
                  type="checkbox"
                  checked={form.allergens.includes(option)}
                  onChange={(e) => toggleAllergen(option, e.target.checked)}
                  aria-invalid={errors.allergens ? true : undefined}
                  aria-describedby={errors.allergens ? "allergens-error" : undefined}
                  className="h-4 w-4 accent-leaf"
                />
                {option}
              </label>
            ))}
          </div>
          {errors.allergens && (
            <p id="allergens-error" className="mt-2 text-sm text-amber-700">
              {errors.allergens}
            </p>
          )}
        </fieldset>

        <div className="sm:col-span-2 flex flex-col gap-4">
          {summary && (
            <p role="alert" className="text-sm font-semibold text-amber-700">
              {summary}
            </p>
          )}
          {mutation.isPending && (
            <p role="status" className="text-sm font-semibold text-forest">
              Publishing your donation...
            </p>
          )}
          {mutation.isError && (
            <p role="alert" className="text-sm font-semibold text-amber-700">
              {mutation.error instanceof Error ? mutation.error.message : "Something went wrong. Please try again."}
            </p>
          )}
          {mutation.isSuccess && mutation.data && (
            <p role="status" className="text-sm font-semibold text-forest">
              {"Donation listed: " + mutation.data.foodName + " (" + mutation.data.servings + " servings)."}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="min-h-[48px] rounded-full bg-leaf px-6 font-semibold text-white hover:bg-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mutation.isPending ? "Publishing..." : "Publish donation"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
