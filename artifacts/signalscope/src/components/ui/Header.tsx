import { Link } from "wouter";
import { BRAND } from "@/lib/branding";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <img
            src={BRAND.logoIcon}
            alt=""
            aria-hidden="true"
            className="h-8 w-8 shrink-0 object-contain"
          />
          <div>
            <p className="font-semibold text-sm tracking-tight text-foreground">SignalScope</p>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Intelligence Workspace
        </div>
      </div>
    </header>
  );
}