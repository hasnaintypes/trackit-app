import { FileSearch, type LucideIcon } from "lucide-react";
import * as React from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  className = "",
}) => {
  const Icon = icon ?? FileSearch;
  return (
    <div
      className={`flex min-h-[300px] w-full flex-col items-center justify-center ${className}`}
    >
      {Icon && (
        <div className="mb-6 rounded-full bg-slate-100 p-4">
          <Icon className="text-muted-foreground h-8 w-8" />
        </div>
      )}
      <h3 className="mb-1 text-base font-medium text-slate-900">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm text-center text-sm">
        {description}
      </p>
      <div className="h-1 w-16 rounded-full bg-gradient-to-r from-slate-200 to-slate-300" />
    </div>
  );
};
