const pressLogos = [
  { name: "Outlook", style: "text-red-600" },
  { name: "Economic Times", style: "text-gray-800" },
  { name: "Forbes", style: "text-gray-900 font-serif" },
  { name: "mint", style: "text-green-600" },
  { name: "THE HINDU", style: "text-gray-800" },
  { name: "QUARTZ", style: "text-gray-700" },
];

const investors = [
  { name: "Pulkit Jain", role: "Co-founder, Vedantu", color: "from-blue-400 to-cyan-500" },
  { name: "Varun Alagh", role: "Co-founder, Mamaearth", color: "from-green-400 to-emerald-500" },
  { name: "Krafton", role: "Krafton", color: "from-violet-400 to-purple-500" },
  { name: "Peer Capital", role: "Peer Capital", color: "from-amber-400 to-orange-500" },
  { name: "Niraj Singh", role: "Founder, Spinny", color: "from-pink-400 to-rose-500" },
];

export default function Press() {
  return (
    <section className="py-12 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-20">
          <p className="text-gray-500 mb-4 sm:mb-8 text-sm sm:text-lg">We&apos;ve been featured in</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 md:gap-12">
            {pressLogos.map((logo, index) => (
              <span 
                key={index} 
                className={`text-sm sm:text-lg md:text-xl font-bold ${logo.style} opacity-70 hover:opacity-100 transition-opacity duration-300 cursor-pointer font-display`}
              >
                {logo.name}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-black font-display">
            Investor spotlight
          </h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8">
          {investors.map((investor, index) => (
            <div 
              key={index} 
              className="text-center group cursor-pointer"
            >
              <div className={`w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-5 rounded-full bg-gradient-to-br ${investor.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 flex items-center justify-center`}>
                <span className="text-white text-lg sm:text-2xl font-bold">{investor.name.charAt(0)}</span>
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors text-xs sm:text-base font-display">{investor.name}</h4>
              <p className="text-[10px] sm:text-sm text-gray-500 hidden sm:block">{investor.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
