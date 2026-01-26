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
    <section className="py-6 sm:py-10 bg-black overflow-hidden">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
        
        <div className="flex animate-marquee">
          {[...brands, ...brands, ...brands].map((brand, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-4 sm:mx-8 md:mx-12 group cursor-pointer"
            >
              <span className={`text-base sm:text-xl md:text-2xl font-bold ${brand.color} opacity-60 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-display`}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
