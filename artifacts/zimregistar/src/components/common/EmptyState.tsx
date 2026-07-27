import type { LucideIcon } from "lucide-react";
export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string; }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <Icon className="h-8 w-8 mb-3 opacity-40" />
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 text-xs opacity-70">{description}</p>}
    </div>
  );
}