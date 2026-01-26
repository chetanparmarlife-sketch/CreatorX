const comparisons = [
  { aspect: "Time", traditional: "Weeks of back-and-forth", creatorx: "Matched in 2 minutes" },
  { aspect: "Pricing", traditional: "Unpredictable pricing", creatorx: "Standardized, transparent rates" },
  { aspect: "Creator access", traditional: "Manual search & endless DMs", creatorx: "Smart Matching with 5K-250K creators" },
  { aspect: "Communication", traditional: "Scattered chats & spreadsheets", creatorx: "One platform for everything" },
  { aspect: "Performance", traditional: "Hard to measure impact", creatorx: "Real-time tracking & verified metrics" },
];

export default function Comparison() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            Still using the traditional<br />way to build your brand?
          </h2>
        </div>

        <div className="bg-gray-50 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-6">
            <div></div>
            <div className="bg-black rounded-2xl p-4 text-center">
              <h3 className="text-white font-bold">Traditional way</h3>
            </div>
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 text-center">
              <h3 className="text-white font-bold flex items-center justify-center gap-2">
                CreatorX way
                <span>✦</span>
              </h3>
            </div>
          </div>

          {comparisons.map((item, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 px-6 py-4 border-t border-gray-200">
              <div className="font-semibold text-gray-900">{item.aspect}</div>
              <div className="text-gray-600 bg-gray-100 rounded-xl p-3 text-center text-sm">{item.traditional}</div>
              <div className="text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-3 text-center text-sm font-medium">{item.creatorx}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
