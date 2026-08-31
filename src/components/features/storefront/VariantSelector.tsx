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
  onVariantSelected: (variant: Variant | undefined, previewVariant?: Variant | undefined) => void;
}

export function VariantSelector({ optionTypes, variants, onVariantSelected }: Props) {
  // selected option_type_id -> option_value_id
  const [selected, setSelected] = useState<Record<number, number>>({});

  // Reset selection when variants or optionTypes change
  useEffect(() => {
    setSelected({});
    onVariantSelected(undefined, undefined);
  }, [variants, optionTypes]);

  // Helper to check if a combination of option values is supported by at least one variant
  const isCombinationValid = (tempSelected: Record<number, number>) => {
    return variants.some((variant: any) => {
      return Object.entries(tempSelected).every(([typeId, valId]) => {
        return variant.variant_option_values?.some(
          (vov: any) => String(vov.option_value_id) === String(valId)
        );
      });
    });
  };

  const handleSelect = (optionTypeId: number, optionValueId: number) => {
    // If clicking the already selected option, toggle it off
    if (selected[optionTypeId] === optionValueId) {
      const nextSelected = { ...selected };
      delete nextSelected[optionTypeId];
      setSelected(nextSelected);
      onVariantSelected(undefined);
      return;
    }

    let nextSelected = { ...selected, [optionTypeId]: optionValueId };

    // If this new combination is totally invalid (e.g. they clicked a conflicting color)
    // we prioritize the newly clicked option and clear the other selections.
    if (!isCombinationValid(nextSelected)) {
      nextSelected = { [optionTypeId]: optionValueId };
    }

    setSelected(nextSelected);

    // Find a partial match for previewing images (first variant matching current partial selection)
    const partialMatch = variants.find((variant: any) => {
      return Object.entries(nextSelected).every(([typeId, valId]) => {
        return variant.variant_option_values?.some(
          (vov: any) => String(vov.option_value_id) === String(valId)
        );
      });
    });

    // If all options are selected, report full match + preview
    if (Object.keys(nextSelected).length === optionTypes.length) {
      onVariantSelected(partialMatch, partialMatch);
    } else {
      // Otherwise, no full match, but provide preview variant for image updates
      onVariantSelected(undefined, partialMatch);
    }
  };

  const colorMap: Record<string, string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-400",
    black: "bg-black",
    white: "bg-white border border-gray-300",
    gray: "bg-gray-500",
    "charcoal gray": "bg-[#4b4f54]",
    purple: "bg-purple-500",
    pink: "bg-pink-300",
    orange: "bg-orange-500",
    beige: "bg-[#e5d9c5]",
  };

  return (
    <div className="space-y-8">
      {optionTypes.map((type) => {
        const isColor = type.name.toLowerCase() === "color";
        const selectedValue = type.option_values.find(v => selected[type.id] === v.id);

        return (
          <div key={type.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                {type.name}:
                {selectedValue && (
                  <span className="font-normal text-slate-500 capitalize">{selectedValue.value}</span>
                )}
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {type.option_values.map((val) => {
                const isSelected = selected[type.id] === val.id;
                const isAvailableAtAll = isCombinationValid({ [type.id]: val.id });
                const isAvailableInCurrentSelection = isCombinationValid({ ...selected, [type.id]: val.id });

                const isTrulyDisabled = !isAvailableAtAll;
                const isConflicting = !isTrulyDisabled && !isAvailableInCurrentSelection;

                if (isColor) {
                  const valLower = val.value.toLowerCase();
                  const bgClass = colorMap[valLower] || colorMap[valLower.split(' ')[0]] || "bg-muted";
                  return (
                    <button
                      key={val.id}
                      type="button"
                      disabled={isTrulyDisabled}
                      onClick={() => handleSelect(type.id, val.id)}
                      className={`relative w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-200 ${isSelected ? "ring-1 ring-black ring-offset-2" : "ring-1 ring-transparent hover:ring-black/20 ring-offset-2"
                        } ${isTrulyDisabled ? "opacity-20 cursor-not-allowed" : isConflicting ? "opacity-40" : "opacity-100"}`}
                      title={val.value}
                    >
                      <span className={`w-full h-full rounded-full ${bgClass}`} />
                      {(isTrulyDisabled || isConflicting) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[120%] h-[1.5px] bg-black/40 rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={val.id}
                    type="button"
                    disabled={isTrulyDisabled}
                    onClick={() => handleSelect(type.id, val.id)}
                    className={`min-w-[50px] h-9 px-4 flex items-center justify-center rounded-md border text-xs font-semibold transition-all duration-200 ${
                      isSelected 
                        ? "border-black bg-black text-white" 
                        : "border-slate-200 bg-white text-slate-800 hover:border-black"
                    } ${isConflicting ? "opacity-40 line-through" : ""}`}
                  >
                    {val.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
