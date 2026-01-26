export default function CreatorShowcase() {
  const creatorContent = [
    { bg: "from-pink-400 to-rose-500", label: "GET READY WITH NYKAA" },
    { bg: "from-amber-400 to-orange-500", label: "" },
    { bg: "from-emerald-400 to-teal-500", label: "" },
    { bg: "from-violet-400 to-purple-500", label: "" },
    { bg: "from-rose-400 to-pink-500", label: "" },
    { bg: "from-cyan-400 to-blue-500", label: "Haus & Kinder" },
  ];

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">
          Made by real people
        </h2>
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#c8ff00] mb-4">
          For real people
        </p>
        <p className="text-lg text-gray-600 mb-12">
          A community of 50000+ creators
        </p>

        <div className="flex justify-center gap-4 overflow-x-auto pb-4">
          {creatorContent.map((item, index) => (
            <div
              key={index}
              className={`w-40 h-56 sm:w-48 sm:h-64 rounded-2xl bg-gradient-to-br ${item.bg} flex-shrink-0 shadow-lg relative overflow-hidden`}
            >
              {item.label && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                    <span className="text-white text-xs font-bold">{item.label}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
