const props = [
  { text: "Starting at just ₹2900*" },
  { text: "Setup takes 30 seconds." },
  { text: "No subscription fees" },
  { text: "Content within 72 hours" },
  { text: "Save up to 30% on spends" },
];

export default function ValueProps() {
  return (
    <section className="py-4 bg-black border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {props.map((prop, index) => (
            <div key={index} className="flex items-center gap-3 text-white">
              <span className="text-violet-400 text-lg">✦</span>
              <span className="font-medium text-sm sm:text-base">{prop.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
