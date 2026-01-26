const props = [
  { icon: "💰", text: "Starting at just $99" },
  { icon: "⚡", text: "Setup in 30 seconds" },
  { icon: "🎯", text: "No subscription fees" },
  { icon: "📦", text: "Content within 72 hours" },
  { icon: "💎", text: "Save up to 30% on spends" },
];

export default function ValueProps() {
  return (
    <section className="py-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
          {props.map((prop, index) => (
            <div key={index} className="flex items-center gap-2 text-white">
              <span className="text-xl">{prop.icon}</span>
              <span className="font-medium">{prop.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
