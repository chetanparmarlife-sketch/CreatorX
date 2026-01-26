const props = [
  { icon: "💰", text: "Starting at just ₹2900*" },
  { icon: "⚡", text: "Setup takes 30 seconds" },
  { icon: "🎯", text: "No subscription fees" },
  { icon: "📦", text: "Content within 72 hours" },
  { icon: "💎", text: "Save up to 30% on spends" },
];

export default function ValueProps() {
  return (
    <section className="py-6 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {props.map((prop, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 text-white group cursor-default"
            >
              <span className="text-violet-400 text-lg group-hover:scale-125 transition-transform duration-300">✦</span>
              <span className="font-medium text-sm sm:text-base group-hover:text-[#c8ff00] transition-colors duration-300">
                {prop.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
