"use client";

import { motion } from "framer-motion";

const brands = [
  { name: "GrowFi", color: "text-green-400" },
  { name: "GLPL", color: "text-white" },
  { name: "indē wild", color: "text-emerald-400" },
  { name: "THE MAN COMPANY", color: "text-gray-300" },
  { name: "super.money", color: "text-violet-400" },
  { name: "KIRO", color: "text-pink-400" },
  { name: "BEARDO", color: "text-amber-400" },
  { name: "NYKAA", color: "text-pink-500" },
  { name: "perfora", color: "text-cyan-400" },
  { name: "TATA 1mg", color: "text-red-400" },
  { name: "FIZZY", color: "text-lime-400" },
];

export default function BrandMarquee() {
  return (
    <section className="py-10 bg-black overflow-hidden border-y border-white/5">
      <div className="relative flex">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
        
        <motion.div 
          className="flex items-center gap-12 px-12"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
        >
          {[...brands, ...brands, ...brands, ...brands].map((brand, index) => (
            <div
              key={index}
              className="flex-shrink-0 group cursor-pointer"
            >
              <span className={`text-2xl md:text-4xl font-bold ${brand.color} opacity-40 group-hover:opacity-100 transition-all duration-300 font-space-grotesk whitespace-nowrap`}>
                {brand.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
