const brands = [
  "Nykaa", "Beardo", "Tata 1mg", "Kent", "Perfora",
  "IndieWild", "The Man Company", "Kiro", "GrowFi", "Fizzy"
];

export default function BrandMarquee() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
          Trusted by 500+ leading brands
        </p>
      </div>
      
      <div className="overflow-hidden">
        <div className="flex animate-marquee">
          {[...brands, ...brands, ...brands].map((brand, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-8 px-8 py-4 bg-gray-50 rounded-xl"
            >
              <span className="text-lg font-semibold text-gray-400">{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
