const comparisons = [
  { aspect: "Time", traditional: "Weeks of back-and-forth", creatorx: "Matched in 2 minutes" },
  { aspect: "Pricing", traditional: "Unpredictable pricing", creatorx: "Transparent rates" },
  { aspect: "Creator access", traditional: "Manual search & DMs", creatorx: "Smart Matching" },
  { aspect: "Communication", traditional: "Scattered chats", creatorx: "One platform" },
  { aspect: "Performance", traditional: "Hard to measure", creatorx: "Real-time tracking" },
];

export default function Comparison() {
  return (
    <section className="py-12 sm:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight font-display mobile-text-balance">
            Still using the traditional
            <br className="hidden sm:block" />{" "}way to build your brand?
          </h2>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-6 bg-gray-50">
            <div></div>
            <div className="bg-black rounded-lg sm:rounded-2xl p-3 sm:p-5 text-center shadow-lg">
              <h3 className="text-white font-bold text-xs sm:text-lg">Traditional</h3>
            </div>
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg sm:rounded-2xl p-3 sm:p-5 text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer"></div>
              <h3 className="text-white font-bold text-xs sm:text-lg flex items-center justify-center gap-1 sm:gap-2 relative z-10">
                CreatorX
                <span className="animate-bounce-subtle hidden sm:inline">✦</span>
              </h3>
            </div>
          </div>

          {comparisons.map((item, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-3 gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-5 ${index !== comparisons.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors duration-300`}
            >
              <div className="font-bold text-gray-900 flex items-center text-xs sm:text-base">{item.aspect}</div>
              <div className="text-gray-600 bg-gray-100 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center text-[10px] sm:text-sm flex items-center justify-center">
                {item.traditional}
              </div>
              <div className="text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center text-[10px] sm:text-sm font-medium flex items-center justify-center shadow-md">
                {item.creatorx}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
