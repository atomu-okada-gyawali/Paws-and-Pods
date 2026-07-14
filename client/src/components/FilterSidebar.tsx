/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeEvent } from "react";
import { PetType, ProductFilters, ProductSize } from "../types";

const CATEGORIES = ["Beds", "Wellness", "Toys", "Furniture", "Accessories"];
const PET_TYPES: PetType[] = ["Dog", "Cat", "Hamster"];
const SIZES: ProductSize[] = ["Small", "Medium", "Large"];

interface FilterSidebarProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  function toggleCategory(category: string) {
    onChange({ ...filters, category: filters.category === category ? undefined : category });
  }

  function togglePetType(petType: PetType) {
    onChange({ ...filters, petType: filters.petType === petType ? undefined : petType });
  }

  function toggleSize(size: ProductSize) {
    onChange({ ...filters, size: filters.size === size ? undefined : size });
  }

  function handleMinPrice(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    onChange({ ...filters, minPrice: value === "" ? undefined : Number(value) });
  }

  function handleMaxPrice(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    onChange({ ...filters, maxPrice: value === "" ? undefined : Number(value) });
  }

  const hasActiveFilters =
    filters.category || filters.petType || filters.size || filters.minPrice || filters.maxPrice;

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ sort: filters.sort })}
            className="text-xs font-semibold text-emerald-700 hover:underline focus:outline-none focus:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <fieldset>
        <legend className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2.5">Pet</legend>
        <div className="space-y-2">
          {PET_TYPES.map((petType) => (
            <label key={petType} className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.petType === petType}
                onChange={() => togglePetType(petType)}
                className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
              />
              {petType}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2.5">Category</legend>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category === category}
                onChange={() => toggleCategory(category)}
                className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
              />
              {category}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2.5">Size</legend>
        <div className="space-y-2">
          {SIZES.map((size) => (
            <label key={size} className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.size === size}
                onChange={() => toggleSize(size)}
                className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
              />
              {size}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2.5">Price</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={handleMinPrice}
            className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-neutral-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={handleMaxPrice}
            className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </fieldset>
    </aside>
  );
}
