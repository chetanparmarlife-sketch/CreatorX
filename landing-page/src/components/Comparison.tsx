const comparisons = [
  { aspect: "Time", traditional: "Weeks of back-and-forth", creatorx: "Matched in 2 minutes" },
  { aspect: "Pricing", traditional: "Unpredictable pricing", creatorx: "Standardized, transparent rates" },
  { aspect: "Creator access", traditional: "Manual search & endless DMs", creatorx: "Smart Matching with 5K-250K creators" },
  { aspect: "Communication", traditional: "Scattered chats & spreadsheets", creatorx: "One platform for everything" },
  { aspect: "Performance", traditional: "Hard to measure impact", creatorx: "Real-time tracking & verified metrics" },
];

export default function Comparison() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-black leading-tight">
            Still using the traditional
            <br />way to build your brand?
          </h2>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50">
            <div></div>
            <div className="bg-black rounded-2xl p-5 text-center shadow-lg">
              <h3 className="text-white font-bold text-lg">Traditional way</h3>
            </div>
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer"></div>
              <h3 className="text-white font-bold text-lg flex items-center justify-center gap-2 relative z-10">
                CreatorX way
                <span className="animate-bounce-subtle">✦</span>
              </h3>
            </div>
          </div>

          {comparisons.map((item, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-3 gap-4 px-6 py-5 ${index !== comparisons.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors duration-300`}
            >
              <div className="font-bold text-gray-900 flex items-center">{item.aspect}</div>
              <div className="text-gray-600 bg-gray-100 rounded-xl p-4 text-center text-sm flex items-center justify-center">
                {item.traditional}
              </div>
              <div className="text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 text-center text-sm font-medium flex items-center justify-center shadow-md">
                {item.creatorx}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
