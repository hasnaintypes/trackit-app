import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 20, className, showText = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Wallet className="text-primary" size={size} strokeWidth={2} />
      {showText && (
        <span className="font-medium text-black dark:text-white">Cashio</span>
      )}
    </div>
  );
}

/**
 * LogoIcon variant for integration grids and small icon contexts.
 */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <Wallet className={cn("text-primary h-6 w-6", className)} strokeWidth={2} />
  );
}
