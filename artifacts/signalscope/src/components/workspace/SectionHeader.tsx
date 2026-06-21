import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export default function SectionHeader({ title, description, icon: Icon }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
