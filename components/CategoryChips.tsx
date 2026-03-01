'use client';

import {
  BookOpen,
  Gift,
  Dices,
  Palette,
  Lightbulb,
  Heart,
  ShoppingBag,
  Sparkles,
  Clock,
  Zap,
} from 'lucide-react';


const ICON_MAP: Record<string, any> = {
  stationery: BookOpen,
  gifts: Gift,
  toys: Dices,
  art: Palette,
  educational: Lightbulb,
  accessories: Heart,
  'school-bags': ShoppingBag,
  trending: Zap,
};

const CATEGORIES = [
  { id: 'stationery', name: 'Stationery', icon: BookOpen },
  { id: 'gifts', name: 'Gifts', icon: Gift },
  { id: 'toys', name: 'Toys', icon: Dices },
  { id: 'art', name: 'Art & Craft', icon: Palette },
  { id: 'educational', name: 'Educational', icon: Lightbulb },
  { id: 'accessories', name: 'Accessories', icon: Heart },
  { id: 'school-bags', name: 'School Bags', icon: ShoppingBag },
  { id: 'trending', name: 'Trending', icon: Zap },
];

interface CategoryChipsProps {
  onCategorySelect?: (categoryId: string) => void;
  className?: string;
}

export function CategoryChips({ onCategorySelect, className = '' }: CategoryChipsProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
      {CATEGORIES.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onCategorySelect?.(id)}
          className="flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-100 transition cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#005F5F] to-[#004545] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#FFC000]" />
          </div>
          <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
            {name}
          </span>
        </button>
      ))}


      
    </div>



  );
}
