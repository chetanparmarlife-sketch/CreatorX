const features = [
  {
    title: "Smart matching",
    description: "Match with creators having 5K-250K followers across 50+ categories",
    cta: "Start your campaign",
    bgColor: "bg-[#fef000]",
    textColor: "text-black",
  },
  {
    title: "Transparent pricing",
    description: "Pay only for what you need. Save 100s of hours on negotiations",
    cta: "Book a demo",
    bgColor: "bg-[#a3ff00]",
    textColor: "text-black",
  },
  {
    title: "2X Creator options",
    description: "Receive double the creator applications. Get refunded for the rest",
    cta: "See for yourself",
    bgColor: "bg-[#00f5d4]",
    textColor: "text-black",
  },
  {
    title: "Barter-friendly",
    description: "Get up to 25%* discount when shipping products on creator cost. Work with top creators",
    cta: "Book a demo",
    bgColor: "bg-[#b8f4d4]",
    textColor: "text-black",
  },
  {
    title: "On time delivery",
    description: "Choose from twice the creators you need. Cancel if deadlines are not met",
    cta: "Sign up now",
    bgColor: "bg-[#00d4aa]",
    textColor: "text-black",
  },
  {
    title: "Flexible cancellations",
    description: "Industry's most flexible cancellation policy. 50-100%* refund at any stage. No questions asked",
    cta: "Start campaign now",
    bgColor: "bg-[#7dd3fc]",
    textColor: "text-black",
  },
];

export default function WhyCreatorX() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Why 1,000+ brands choose{" "}
            <span className="text-[#c8ff00]">CreatorX</span>
          </h2>
        </div>

        <div className="space-y-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bgColor} rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8`}
            >
              <div className="flex-1">
                <span className="inline-block px-4 py-1.5 bg-black/10 rounded-full text-sm font-medium mb-4">
                  Why CreatorX?
                </span>
                <h3 className={`text-3xl lg:text-4xl font-bold ${feature.textColor} mb-4`}>
                  {feature.title}
                </h3>
                <ul className="space-y-2 mb-6">
                  {feature.description.split('. ').map((point, i) => (
                    <li key={i} className={`flex items-start gap-2 ${feature.textColor}`}>
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className="inline-block px-6 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  {feature.cta}
                </a>
              </div>
              <div className="flex-1 w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-50 rounded mt-4"></div>
                    <div className="h-8 bg-gray-50 rounded"></div>
                    <div className="h-8 bg-gray-50 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
