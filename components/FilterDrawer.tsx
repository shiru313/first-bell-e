'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Category {
  id: string;
  name: string;
}



interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  subCategories: SubCategory[];
  selectedCategory: string | null;
  selectedSubCategory: string | null;
  onCategoryChange: (id: string) => void;
  onSubCategoryChange: (id: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
}
export function FilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
}: FilterDrawerProps) {
  const [minPrice, setMinPrice] = useState(priceRange[0].toString());
  const [maxPrice, setMaxPrice] = useState(priceRange[1].toString());

  const handleApplyPrice = () => {
    onPriceChange([Number(minPrice) || 0, Number(maxPrice) || 999999]);
    onClose();
  };

 return (
  <Sheet open={isOpen} onOpenChange={onClose}>
    <SheetContent
      side="left"
      className="w-[300px] p-0 bg-white flex flex-col"
    >
      {/* HEADER */}
      <div className="px-6 py-5 border-b bg-gradient-to-r from-[#005F5F] to-[#004747] text-white">
        <h2 className="text-lg font-semibold tracking-wide">
          Filters
        </h2>
        <p className="text-xs text-white/80 mt-1">
          Refine your shopping experience
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

        {/* ================= CATEGORY SECTION ================= */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
            Categories
          </h3>

          <div className="flex flex-wrap gap-2">
            {/* ALL BUTTON */}
            <button
              onClick={() => {
                onCategoryChange('all');
                onClose();
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-[#005F5F] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryChange(cat.id);
                  onClose();
                }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-[#005F5F] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ================= PRICE SECTION ================= */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
            Price Range
          </h3>

          <div className="bg-gray-50 rounded-2xl p-4 border space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="text-sm rounded-lg"
              />

              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="text-sm rounded-lg"
              />
            </div>

            <Button
              onClick={handleApplyPrice}
              className="w-full bg-[#FFC000] hover:bg-[#e6ac00] text-[#005F5F] font-semibold rounded-xl"
            >
              Apply Filter
            </Button>
          </div>
        </div>

      </div>

      {/* FOOTER RESET */}
      <div className="px-6 py-4 border-t bg-white">
        <button
          onClick={() => {
            onCategoryChange('all');
            onPriceChange([0, 999999]);
            onClose();
          }}
          className="text-xs text-gray-500 hover:text-black transition"
        >
          Reset Filters
        </button>
      </div>
    </SheetContent>
  </Sheet>
);
}
