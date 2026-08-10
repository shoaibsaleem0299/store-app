"use client";

import { useState, useEffect } from "react";
import type { OptionType, OptionValue, Variant } from "@/types/product.types";
import { Button } from "@/components/ui/button";

interface OptionTypeWithValues extends OptionType {
  option_values: OptionValue[];
}

interface Props {
  optionTypes: OptionTypeWithValues[];
  variants: Variant[];
  onVariantSelected: (variant: Variant | undefined) => void;
}

export function VariantSelector({ optionTypes, variants, onVariantSelected }: Props) {
  // selected option_type_id -> option_value_id
  const [selected, setSelected] = useState<Record<number, number>>({});

  // Reset selection when variants or optionTypes change
  useEffect(() => {
    setSelected({});
    onVariantSelected(undefined);
  }, [variants, optionTypes]);

  // Helper to check if a combination of option values is supported by at least one variant
  const isCombinationValid = (tempSelected: Record<number, number>) => {
    return variants.some((variant: any) => {
      return Object.entries(tempSelected).every(([typeId, valId]) => {
        return variant.variant_option_values?.some(
          (vov: any) => vov.option_value_id === valId
        );
      });
    });
  };

  const handleSelect = (optionTypeId: number, optionValueId: number) => {
    const nextSelected = { ...selected, [optionTypeId]: optionValueId };
    setSelected(nextSelected);

    // If all options are selected, find and report matching variant
    if (Object.keys(nextSelected).length === optionTypes.length) {
      const match = variants.find((variant: any) => {
        return Object.entries(nextSelected).every(([typeId, valId]) => {
          return variant.variant_option_values?.some(
            (vov: any) => vov.option_value_id === valId
          );
        });
      });
      onVariantSelected(match);
    } else {
      onVariantSelected(undefined);
    }
  };

  const colorMap: Record<string, string> = {
    red: "bg-red-500 hover:bg-red-600",
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    black: "bg-black hover:bg-black/90",
    white: "bg-white border border-gray-300 text-black hover:bg-gray-50",
    gray: "bg-gray-500 hover:bg-gray-600",
    purple: "bg-purple-500 hover:bg-purple-600",
    pink: "bg-pink-500 hover:bg-pink-600",
    orange: "bg-orange-500 hover:bg-orange-600",
  };

  return (
    <div className="space-y-6">
      {optionTypes.map((type) => {
        const isColor = type.name.toLowerCase() === "color";

        return (
          <div key={type.id} className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              Select {type.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {type.option_values.map((val) => {
                const isSelected = selected[type.id] === val.id;
                const isDisabled = !isCombinationValid({ ...selected, [type.id]: val.id });

                if (isColor) {
                  const bgClass = colorMap[val.value.toLowerCase()] || "bg-muted";
                  return (
                    <button
                      key={val.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSelect(type.id, val.id)}
                      className={`relative w-8 h-8 rounded-full transition-all duration-200 ${bgClass} ${
                        isSelected ? "ring-2 ring-primary ring-offset-2" : "opacity-80 hover:opacity-100"
                      } ${isDisabled ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                      title={val.value}
                    >
                      {isDisabled && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[2px] bg-destructive rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                }

                return (
                  <Button
                    key={val.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    disabled={isDisabled}
                    onClick={() => handleSelect(type.id, val.id)}
                    className="min-w-[40px] h-10 px-3 transition-all duration-200"
                  >
                    {val.value}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
