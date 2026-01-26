const props = [
  { text: "Starting at just ₹2900*" },
  { text: "Setup takes 30 seconds" },
  { text: "No subscription fees" },
  { text: "Content within 72 hours" },
  { text: "Save up to 30%" },
];

export default function ValueProps() {
  return (
    <section className="py-4 sm:py-6 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-10">
          {props.map((prop, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 sm:gap-3 text-white group cursor-default"
            >
              <span className="text-violet-400 text-sm sm:text-lg group-hover:scale-125 transition-transform duration-300">✦</span>
              <span className="font-medium text-xs sm:text-sm md:text-base group-hover:text-[#c8ff00] transition-colors duration-300 whitespace-nowrap">
                {prop.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
