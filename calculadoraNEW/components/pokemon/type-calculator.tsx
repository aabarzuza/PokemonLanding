"use client";

import { useState } from "react";
import {
  POKEMON_TYPES,
  TYPE_COLORS,
  TYPE_NAMES_ES,
  getDualTypeEffectiveness,
  type PokemonType,
} from "@/lib/pokemon-types";
import { TypeBadge } from "./type-badge";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function TypeCalculator() {
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);

  const toggleType = (type: PokemonType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      }
      if (prev.length >= 2) {
        return [prev[1], type];
      }
      return [...prev, type];
    });
  };

  const clearTypes = () => setSelectedTypes([]);

  // Calcular debilidades y resistencias
  const matchups = POKEMON_TYPES.map((attackType) => {
    const effectiveness = getDualTypeEffectiveness(
      attackType,
      selectedTypes[0],
      selectedTypes[1]
    );
    return { type: attackType, effectiveness };
  });

  const weakTo = matchups.filter((m) => m.effectiveness > 1);
  const resistantTo = matchups.filter((m) => m.effectiveness > 0 && m.effectiveness < 1);
  const immuneTo = matchups.filter((m) => m.effectiveness === 0);
  const normalTo = matchups.filter((m) => m.effectiveness === 1);

  return (
    <div className="space-y-6">
      {/* Selector de tipos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Selecciona hasta 2 tipos
          </h3>
          {selectedTypes.length > 0 && (
            <button
              onClick={clearTypes}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {POKEMON_TYPES.map((type) => (
            <TypeBadge
              key={type}
              type={type}
              size="md"
              selected={selectedTypes.includes(type)}
              onClick={() => toggleType(type)}
            />
          ))}
        </div>
      </div>

      {/* Tipos seleccionados */}
      {selectedTypes.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-center gap-3">
            {selectedTypes.map((type, index) => (
              <div key={type} className="flex items-center gap-2">
                {index > 0 && <span className="text-muted-foreground">/</span>}
                <div
                  className="px-4 py-2 rounded-lg font-bold text-lg"
                  style={{
                    backgroundColor: TYPE_COLORS[type],
                    color: getContrastColor(TYPE_COLORS[type]),
                  }}
                >
                  {TYPE_NAMES_ES[type]}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de resultados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Débil a */}
            <MatchupSection
              title="Débil a"
              matchups={weakTo}
              emptyText="Ninguna debilidad"
              bgClass="bg-red-500/10 border-red-500/20"
            />

            {/* Resistente a */}
            <MatchupSection
              title="Resistente a"
              matchups={resistantTo}
              emptyText="Ninguna resistencia"
              bgClass="bg-emerald-500/10 border-emerald-500/20"
            />

            {/* Inmune a */}
            <MatchupSection
              title="Inmune a"
              matchups={immuneTo}
              emptyText="Ninguna inmunidad"
              bgClass="bg-zinc-500/10 border-zinc-500/20"
            />

            {/* Normal */}
            <MatchupSection
              title="Daño normal"
              matchups={normalTo}
              emptyText="—"
              bgClass="bg-zinc-500/5 border-zinc-500/10"
              compact
            />
          </div>
        </div>
      )}

      {selectedTypes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Selecciona uno o dos tipos para ver sus debilidades y resistencias
        </div>
      )}
    </div>
  );
}

interface MatchupSectionProps {
  title: string;
  matchups: { type: PokemonType; effectiveness: number }[];
  emptyText: string;
  bgClass: string;
  compact?: boolean;
}

function MatchupSection({
  title,
  matchups,
  emptyText,
  bgClass,
  compact,
}: MatchupSectionProps) {
  return (
    <div className={cn("rounded-lg border p-4", bgClass)}>
      <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
      {matchups.length > 0 ? (
        <div className={cn("flex flex-wrap gap-1.5", compact && "gap-1")}>
          {matchups.map(({ type, effectiveness }) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className={cn(
                  "rounded px-2 py-0.5 text-xs font-semibold",
                  compact ? "text-[10px]" : "text-xs"
                )}
                style={{
                  backgroundColor: TYPE_COLORS[type],
                  color: getContrastColor(TYPE_COLORS[type]),
                }}
              >
                {TYPE_NAMES_ES[type]}
              </div>
              {effectiveness !== 1 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  {formatEffectiveness(effectiveness)}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
}

function formatEffectiveness(value: number): string {
  if (value === 4) return "4×";
  if (value === 2) return "2×";
  if (value === 0.5) return "½×";
  if (value === 0.25) return "¼×";
  if (value === 0) return "0×";
  return "1×";
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}
