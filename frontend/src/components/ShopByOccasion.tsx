import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight as ArrowRight,
  LuAward as Award,
} from "react-icons/lu";
import { getCategories } from "../lib/api";

export default async function ShopByOccasion() {
  let occasionCategories: Awaited<ReturnType<typeof getCategories>>["categories"] = [];

  try {
    const { categories } = await getCategories();
    occasionCategories = categories.filter((c: any) => c.showInOccasion);
  } catch {
    occasionCategories = [];
  }

  if (occasionCategories.length === 0) return null;

  return (
    <section className="w-full bg-[#faf6f2] py-16 px-4 sm:px-6 lg:px-8 border-b border-[#ebdcd0]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-gray-200/80 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] uppercase text-[#c49a45] mb-2">
              <Award size={12} />
              Special Collections
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl text-gray-950 font-medium tracking-tight">
              Shop by <span className="italic font-playfair text-[#5c1a52]">Occasion</span>
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Handpicked outfits styled for life&apos;s special moments and festive celebrations.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5c1a52] hover:text-[#4a1543] group"
          >
            <span>Explore All Occasions</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Occasions Portrait Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {occasionCategories.map((cat: any) => (
            <Link
              key={cat._id}
              href={`/${cat.slug}`}
              className="group relative aspect-[3/4] sm:aspect-[2/3] rounded-2xl overflow-hidden block shadow-sm hover:shadow-xl transition-all duration-500 bg-[#f0e6dc]"
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-[#f0e6dc]" />
              )}
              
              {/* Vignette Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:h-2/3" />

              {/* Title & Tagline */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-center text-white">
                <p className="font-serif text-lg sm:text-xl font-normal leading-snug tracking-wide group-hover:text-[#f5d796] transition-colors">
                  {cat.name}
                </p>
                {cat.tagline ? (
                  <p className="text-[11px] text-gray-200 mt-1 uppercase tracking-wider line-clamp-1">
                    {cat.tagline}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#f5d796] mt-1 uppercase tracking-widest font-semibold flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Edit</span>
                    <ArrowRight size={10} />
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
