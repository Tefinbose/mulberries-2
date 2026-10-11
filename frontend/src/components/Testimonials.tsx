"use client";

import {
  LuStar as Star,
  LuQuote as Quote,
} from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";

type Review = {
  name: string;
  meta: string;
  timeAgo: string;
  text: string;
  rating: number;
};

const reviews: Review[] = [
  {
    name: "Anjana Ks",
    meta: "Local Guide · 7 reviews · 2 photos",
    timeAgo: "7 months ago",
    text: "Excellent service at Mulberries. I had two dresses and the fit was perfect on the first try. The staff was very attentive and delivered ahead of schedule. Highly recommend. The quality is amazing, and it was shipped very quickly. Thank you Alan, you were so helpful and friendly — I will definitely be a returning customer.",
    rating: 5,
  },
  {
    name: "Shihab Habeeb",
    meta: "Local Guide · 10 reviews · 136 photos",
    timeAgo: "9 months ago",
    text: "Today we visited the store, as we usually do, because it has become one of our favorite places to shop for my wife. She loves coming here, and every visit feels special. The supporting staff, especially Asha, is always friendly and helpful.",
    rating: 5,
  },
  {
    name: "Anu Mary Thomas",
    meta: "4 reviews · 1 photo",
    timeAgo: "3 months ago",
    text: "I purchased 4 salwars within just 30 minutes because Mr. Aneesh understood my preferences from our very first conversation. His service was excellent.",
    rating: 5,
  },
  {
    name: "Naresh Kumar",
    meta: "10 reviews · 2 photos",
    timeAgo: "3 months ago",
    text: "Had an amazing shopping experience at Mulberries, Madina Mall! The store offers a great selection of products, excellent customer service, and a welcoming atmosphere. Highly recommended — Mr. Harris and Ms. Rajula were wonderful.",
    rating: 5,
  },
  {
    name: "Rahmathunnisa",
    meta: "1 review",
    timeAgo: "11 months ago",
    text: "Very good collection. Asha is extremely helpful and attentive when it comes to selecting dresses. She understands our style preferences and gives honest, thoughtful suggestions. Shopping with her is a delightful and stress-free experience.",
    rating: 5,
  },
  {
    name: "Holiday Mining",
    meta: "Local Guide · 118 reviews · 186 photos",
    timeAgo: "3 years ago",
    text: "Have lots of good collection and for that 5 star. Very supportive and smiling staff.",
    rating: 5,
  },
  {
    name: "Subi CS",
    meta: "Local Guide · 17 reviews · 5 photos",
    timeAgo: "6 months ago",
    text: "I actually went to buy just one kurta set because I loved their collection, but I ended up purchasing two outfits — a co-ord set and a kurta set! The collection is really beautiful, trendy, and affordable. The staff were very friendly and helpful.",
    rating: 5,
  },
];

// Duplicate the list once for seamless CSS marquee loop
const marqueeReviews = [...reviews, ...reviews];

export default function Testimonials() {
  return (
    <section className="w-full bg-[#faf6f2] py-20 overflow-hidden border-b border-[#ebdcd0]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center text-[11px] font-bold tracking-[0.22em] uppercase text-[#c49a45] mb-2">
            <span>Customer Love & Reviews</span>
          </div>
          
          <h2 className="font-playfair text-[26px] sm:text-[28px] lg:text-[34px] font-bold text-gray-950 tracking-tight mb-4">
            Words from Our <span className="italic font-playfair text-[#5c1a52]">Happy Customers</span>
          </h2>

          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#ebdcd0] shadow-xs text-xs text-gray-700">
            <FaGoogle size={14} className="text-[#5c1a52]" />
            <span className="text-[13px] sm:text-[14px] font-medium text-gray-950">4.8 Rating</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="fill-[#c49a45] text-[#c49a45]" />
              ))}
            </div>
            <span className="text-[12px] sm:text-[13px] text-gray-400">· Verified Dubai Boutique Reviews</span>
          </div>
        </div>

      </div>

      {/* Marquee Carousel with Fade Gradients */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 md:w-44 bg-gradient-to-r from-[#faf6f2] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 md:w-44 bg-gradient-to-l from-[#faf6f2] to-transparent z-10" />

        <div className="group flex overflow-hidden">
          <div className="flex gap-6 animate-testimonial-scroll group-hover:[animation-play-state:paused] px-4">
            {marqueeReviews.map((review, i) => (
              <div
                key={`${review.name}-${i}`}
                className="flex-shrink-0 w-[310px] sm:w-[360px] bg-white rounded-2xl shadow-sm border border-gray-100 p-7 flex flex-col hover:border-[#5c1a52]/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s < review.rating ? "fill-[#c49a45] text-[#c49a45]" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <Quote size={20} className="text-[#5c1a52]/20" />
                </div>

                <p className="text-[15px] sm:text-[16px] lg:text-[18px] font-normal text-gray-700 leading-[1.55] mb-6 line-clamp-5">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-[#5c1a52] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-xs">
                    {review.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-gray-900 truncate">
                      {review.name}
                    </p>
                    <p className="text-[13px] font-normal text-gray-400 truncate">
                      {review.meta} · {review.timeAgo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes testimonial-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-testimonial-scroll {
          animation: testimonial-scroll 42s linear infinite;
          width: max-content;
        }
      `}</style>
    </section>
  );
}