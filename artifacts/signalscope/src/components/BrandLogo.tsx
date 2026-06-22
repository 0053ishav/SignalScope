import { BRAND } from "@/lib/branding";

/**
 * Full SignalScope logo (icon + wordmark). The provided asset has a light
 * background and a dark navy wordmark, so on the dark theme it is presented
 * inside a clean light "plate" to keep the wordmark legible and intentional.
 */
export function BrandFullLogo({
  className = "",
  imgClassName = "h-12",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 shadow-lg ring-1 ring-black/5 ${className}`}
    >
      <img
        src={BRAND.logoFull}
        alt="SignalScope"
        className={`w-auto object-contain ${imgClassName}`}
      />
    </span>
  );
}
