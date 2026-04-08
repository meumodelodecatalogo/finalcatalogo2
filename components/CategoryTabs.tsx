"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  id?: string;
}

function CategoryTabs({ activeCategory, setActiveCategory, id }: CategoryTabsProps) {
  return (
    <div id={id} className="sticky top-16 z-40 w-full bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all",
                activeCategory === category
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(CategoryTabs);
