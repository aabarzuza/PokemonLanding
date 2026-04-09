"use client";

import { TYPE_COLORS, TYPE_NAMES_ES, type PokemonType } from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";

interface TypeBadgeProps {
  type: PokemonType;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function TypeBadge({
  type,
  size = "md",
  showName = true,
  className,
  onClick,
  selected,
}: TypeBadgeProps) {
  const color = TYPE_COLORS[type];
  const name = TYPE_NAMES_ES[type];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-md transition-all",
        "border-2 border-transparent",
        "hover:scale-105 hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        sizeClasses[size],
        selected && "ring-2 ring-offset-2 ring-white",
        className
      )}
      style={{
        backgroundColor: color,
        color: getContrastColor(color),
        boxShadow: `0 2px 4px ${color}66`,
      }}
    >
      {showName ? name : ""}
    </button>
  );
}

// Determinar si usar texto claro u oscuro basado en el color de fondo
function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}
