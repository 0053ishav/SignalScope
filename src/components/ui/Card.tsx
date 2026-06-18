import { ReactNode } from "react";

export function Card({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-border
        bg-card/80
        backdrop-blur-sm
        p-6
        shadow-lg
        transition-all
        hover:border-violet-500/30
      "
    >
      {children}
    </div>
  );
}