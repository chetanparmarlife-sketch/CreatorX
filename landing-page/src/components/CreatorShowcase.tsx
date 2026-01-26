"use client";

const creatorContent = [
  { bg: "from-pink-400 to-rose-500", label: "GET READY WITH NYKAA", category: "Beauty" },
  { bg: "from-amber-400 to-orange-500", label: "Lifestyle Vlog", category: "Lifestyle" },
  { bg: "from-emerald-400 to-teal-500", label: "Tech Review", category: "Tech" },
  { bg: "from-violet-400 to-purple-500", label: "Fashion Haul", category: "Fashion" },
  { bg: "from-rose-400 to-pink-500", label: "Home Decor", category: "Home" },
  { bg: "from-cyan-400 to-blue-500", label: "Haus & Kinder", category: "Kids" },
];

export default function CreatorShowcase() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-100 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-3">
          Made by real people
        </h2>
        <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c8ff00] to-[#00d4aa] mb-6">
          For real people
        </p>
        <p className="text-xl text-gray-600 mb-16">
          A community of <span className="font-bold text-black">50,000+</span> creators
        </p>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-100 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-100 to-transparent z-10"></div>
          
          <div className="flex justify-center gap-5 overflow-x-auto pb-8 scrollbar-hide">
            {creatorContent.map((item, index) => (
              <div
                key={index}
                className={`w-44 h-64 sm:w-52 sm:h-72 rounded-3xl bg-gradient-to-br ${item.bg} flex-shrink-0 shadow-xl card-hover relative overflow-hidden group cursor-pointer`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-white text-xs font-semibold">{item.category}</span>
                </div>

                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-3">
                    <span className="text-white text-sm font-bold">{item.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
