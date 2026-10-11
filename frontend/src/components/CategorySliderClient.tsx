"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
} from "react-icons/lu";
import type { Category } from "@/lib/api";

type CategorySliderClientProps = {
  categories: Category[];
};

export default function CategorySliderClient({ categories }: CategorySliderClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="relative group/slider">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute -left-2 sm:-left-4 top-[40%] -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-[#ebdcd0] flex items-center justify-center text-gray-700 hover:text-[#5c1a52] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={20} className="stroke-[2.5]" />
        </button>
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute -right-2 sm:-right-4 top-[40%] -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-[#ebdcd0] flex items-center justify-center text-gray-700 hover:text-[#5c1a52] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight size={20} className="stroke-[2.5]" />
        </button>
      )}

      {/* Horizontal Scrolling Track (Flipkart-style rounded items) */}
      <div
        ref={scrollRef}
        className="flex items-start gap-6 sm:gap-8 md:gap-10 overflow-x-auto scroll-smooth py-3 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
      >
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/${category.slug}`}
            className="group/cat flex flex-col items-center flex-shrink-0 cursor-pointer select-none text-center snap-start"
          >
            {/* Rounded Circular Image (Flipkart style) */}
            <div className="relative w-[76px] h-[76px] sm:w-[92px] sm:h-[92px] md:w-[104px] md:h-[104px] rounded-full p-[3px] border-2 border-[#ebdcd0] group-hover/cat:border-[#5c1a52] transition-all duration-300 shadow-xs group-hover/cat:shadow-md bg-white">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-[#faf6f2]">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 76px, (max-width: 1024px) 92px, 104px"
                    className="object-cover object-top transition-transform duration-500 group-hover/cat:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#faf6f2] text-xs font-bold text-[#5c1a52]">
                    {category.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Category Label */}
            <p className="mt-2.5 sm:mt-3 text-[12px] sm:text-[13px] md:text-[14px] font-medium text-gray-800 text-center tracking-normal group-hover/cat:text-[#5c1a52] transition-colors line-clamp-1 max-w-[85px] sm:max-w-[105px]">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
