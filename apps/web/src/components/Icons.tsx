import type { ReactNode } from "react";

type IconProps = { className?: string };

function IconBase({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className={className}
      stroke="currentColor"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function LeafIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19l7-7" />
    </IconBase>
  );
}

export function UtensilsIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M5 3v5a2.5 2.5 0 0 0 5 0V3" />
      <path d="M7.5 3v18" />
      <path d="M17 21V3c-2 1-3 3-3 6v3h3" />
    </IconBase>
  );
}

export function HeartHandIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 8.5c-1.2-1.6-4-1.4-4 1 0 1.8 2.2 3.4 4 5 1.8-1.6 4-3.2 4-5 0-2.4-2.8-2.6-4-1z" />
      <path d="M4 18.5c2 1.5 4.5 2 8 2h2.5a1.5 1.5 0 0 0 0-3H10" />
      <path d="M2.5 15.5h3v6h-3" />
    </IconBase>
  );
}

export function TruckIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </IconBase>
  );
}

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </IconBase>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
      <circle cx="12" cy="10" r="2" />
    </IconBase>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 20h16" />
      <path d="M7 16v-5" />
      <path d="M12 16V8" />
      <path d="M17 16v-8" />
    </IconBase>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </IconBase>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconBase>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </IconBase>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </IconBase>
  );
}
