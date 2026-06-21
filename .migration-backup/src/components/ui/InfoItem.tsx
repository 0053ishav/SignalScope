import { classes } from "@/theme";

export default function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-background/50
        p-4
      "
    >
      <p className={classes.infoLabel}>
        {label}
      </p>

      <p className={classes.infoValue}>
        {value}
      </p>
    </div>
  );
}