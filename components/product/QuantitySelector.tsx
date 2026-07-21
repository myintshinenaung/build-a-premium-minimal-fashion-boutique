"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type QuantitySelectorProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function QuantitySelector({ value, min = 1, max, onChange, disabled = false }: QuantitySelectorProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <div className="inline-flex h-12 items-stretch border border-line">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        className={cn(
          "inline-flex w-12 items-center justify-center text-ink transition-colors",
          canDecrease ? "hover:bg-mist" : "cursor-not-allowed text-stone/50"
        )}
      >
        <Minus size={16} strokeWidth={1.7} />
      </button>
      <span className="inline-flex min-w-12 items-center justify-center border-x border-line px-3 text-sm font-medium text-ink">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        className={cn(
          "inline-flex w-12 items-center justify-center text-ink transition-colors",
          canIncrease ? "hover:bg-mist" : "cursor-not-allowed text-stone/50"
        )}
      >
        <Plus size={16} strokeWidth={1.7} />
      </button>
    </div>
  );
}
