"use client";

import {
  POKEMON_TYPES,
  TYPE_COLORS,
  TYPE_ABBR,
  TYPE_NAMES_ES,
  getEffectiveness,
  type PokemonType,
} from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TypeChartProps {
  highlightAttacker?: PokemonType | null;
  highlightDefender?: PokemonType | null;
  onSelectAttacker?: (type: PokemonType | null) => void;
  onSelectDefender?: (type: PokemonType | null) => void;
}

export function TypeChart({
  highlightAttacker,
  highlightDefender,
  onSelectAttacker,
  onSelectDefender,
}: TypeChartProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    attacker: PokemonType;
    defender: PokemonType;
  } | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
              2×
            </div>
            <span className="text-sm text-muted-foreground">Super efectivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center text-xs font-bold text-white">
              ½
            </div>
            <span className="text-sm text-muted-foreground">Poco efectivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
              0
            </div>
            <span className="text-sm text-muted-foreground">Inmune</span>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-1 text-xs font-medium text-muted-foreground sticky left-0 bg-background z-10">
                <div className="w-10 h-10 flex items-center justify-center">
                  <span className="text-[10px] leading-tight text-center">
                    ATK →<br />DEF ↓
                  </span>
                </div>
              </th>
              {POKEMON_TYPES.map((type) => (
                <th
                  key={type}
                  className="p-0.5"
                  onClick={() => onSelectAttacker?.(highlightAttacker === type ? null : type)}
                >
                  <TypeHeaderCell
                    type={type}
                    isHighlighted={highlightAttacker === type}
                    isHovered={hoveredCell?.attacker === type}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POKEMON_TYPES.map((defender) => (
              <tr key={defender}>
                <td
                  className="p-0.5 sticky left-0 bg-background z-10"
                  onClick={() => onSelectDefender?.(highlightDefender === defender ? null : defender)}
                >
                  <TypeHeaderCell
                    type={defender}
                    isHighlighted={highlightDefender === defender}
                    isHovered={hoveredCell?.defender === defender}
                    horizontal
                  />
                </td>
                {POKEMON_TYPES.map((attacker) => {
                  const effectiveness = getEffectiveness(attacker, defender);
                  const isHighlighted =
                    highlightAttacker === attacker || highlightDefender === defender;

                  return (
                    <td
                      key={`${attacker}-${defender}`}
                      className="p-0.5"
                      onMouseEnter={() => setHoveredCell({ attacker, defender })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <EffectivenessCell
                        effectiveness={effectiveness}
                        isHighlighted={isHighlighted}
                        isHovered={
                          hoveredCell?.attacker === attacker &&
                          hoveredCell?.defender === defender
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tooltip */}
        {hoveredCell && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-4 py-2 shadow-xl z-50">
            <span
              className="font-semibold"
              style={{ color: TYPE_COLORS[hoveredCell.attacker] }}
            >
              {TYPE_NAMES_ES[hoveredCell.attacker]}
            </span>
            <span className="text-muted-foreground mx-2">→</span>
            <span
              className="font-semibold"
              style={{ color: TYPE_COLORS[hoveredCell.defender] }}
            >
              {TYPE_NAMES_ES[hoveredCell.defender]}
            </span>
            <span className="text-muted-foreground mx-2">=</span>
            <EffectivenessLabel
              effectiveness={getEffectiveness(hoveredCell.attacker, hoveredCell.defender)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TypeHeaderCell({
  type,
  isHighlighted,
  isHovered,
  horizontal,
}: {
  type: PokemonType;
  isHighlighted?: boolean;
  isHovered?: boolean;
  horizontal?: boolean;
}) {
  const color = TYPE_COLORS[type];

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-md flex items-center justify-center cursor-pointer transition-all",
        "text-xs font-bold",
        isHighlighted && "ring-2 ring-white ring-offset-2 ring-offset-background",
        isHovered && "scale-110"
      )}
      style={{
        backgroundColor: color,
        color: getContrastColor(color),
      }}
      title={TYPE_NAMES_ES[type]}
    >
      {TYPE_ABBR[type]}
    </div>
  );
}

function EffectivenessCell({
  effectiveness,
  isHighlighted,
  isHovered,
}: {
  effectiveness: number;
  isHighlighted?: boolean;
  isHovered?: boolean;
}) {
  const { bg, text, label } = getEffectivenessStyle(effectiveness);

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-md flex items-center justify-center transition-all",
        "text-xs font-bold",
        isHighlighted && "ring-1 ring-white/50",
        isHovered && "scale-110 z-10"
      )}
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </div>
  );
}

function EffectivenessLabel({ effectiveness }: { effectiveness: number }) {
  const { text, fullLabel } = getEffectivenessStyle(effectiveness);
  return (
    <span className="font-bold" style={{ color: text }}>
      {fullLabel}
    </span>
  );
}

function getEffectivenessStyle(effectiveness: number): {
  bg: string;
  text: string;
  label: string;
  fullLabel: string;
} {
  if (effectiveness === 0) {
    return { bg: "#27272a", text: "#a1a1aa", label: "0", fullLabel: "Inmune (0×)" };
  }
  if (effectiveness === 0.5) {
    return { bg: "#dc2626", text: "#ffffff", label: "½", fullLabel: "Poco efectivo (½×)" };
  }
  if (effectiveness === 0.25) {
    return { bg: "#7f1d1d", text: "#ffffff", label: "¼", fullLabel: "Muy poco efectivo (¼×)" };
  }
  if (effectiveness === 2) {
    return { bg: "#10b981", text: "#ffffff", label: "2", fullLabel: "Super efectivo (2×)" };
  }
  if (effectiveness === 4) {
    return { bg: "#047857", text: "#ffffff", label: "4", fullLabel: "Muy efectivo (4×)" };
  }
  return { bg: "#3f3f46", text: "#a1a1aa", label: "", fullLabel: "Normal (1×)" };
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}
