const brands = [
  "GrowFi", "GLPL", "indē wild", "THE MAN COMPANY", "super.money",
  "KIRO", "BEARDO", "NYKAA", "perfora", "TATA 1mg", "FIZZY"
];

export default function BrandMarquee() {
  return (
    <section className="py-8 bg-black">
      <div className="overflow-hidden">
        <div className="flex animate-marquee">
          {[...brands, ...brands, ...brands].map((brand, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-6 sm:mx-10"
            >
              <span className="text-lg sm:text-xl font-bold text-gray-400 whitespace-nowrap">{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
