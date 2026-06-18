export function Card({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-muted">
        {description}
      </p>
    </div>
  );
}