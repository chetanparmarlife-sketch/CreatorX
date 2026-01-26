"use client";

const features = [
  {
    title: "Smart matching",
    description: ["Match with creators having 5K-250K followers across 50+ categories"],
    cta: "Start your campaign",
    bgColor: "bg-gradient-to-br from-[#fef000] to-[#ffe600]",
    textColor: "text-black",
  },
  {
    title: "Transparent pricing",
    description: ["Pay only for what you need", "Save 100s of hours on negotiations"],
    cta: "Book a demo",
    bgColor: "bg-gradient-to-br from-[#b8ff00] to-[#7dd300]",
    textColor: "text-black",
  },
  {
    title: "2X Creator options",
    description: ["Receive double the creator applications", "Get refunded for the rest"],
    cta: "See for yourself",
    bgColor: "bg-gradient-to-br from-[#00f5d4] to-[#00c4a7]",
    textColor: "text-black",
  },
  {
    title: "Barter-friendly",
    description: ["Get up to 25%* discount when shipping products", "Work with top creators"],
    cta: "Book a demo",
    bgColor: "bg-gradient-to-br from-[#c8f7dc] to-[#a8e6cf]",
    textColor: "text-black",
  },
  {
    title: "On time delivery",
    description: ["Choose from twice the creators you need", "Cancel if deadlines are not met"],
    cta: "Sign up now",
    bgColor: "bg-gradient-to-br from-[#00d4aa] to-[#00a88a]",
    textColor: "text-black",
  },
  {
    title: "Flexible cancellations",
    description: ["Industry's most flexible cancellation policy", "50-100%* refund at any stage"],
    cta: "Start campaign now",
    bgColor: "bg-gradient-to-br from-[#7dd3fc] to-[#38bdf8]",
    textColor: "text-black",
  },
];

export default function WhyCreatorX() {
  return (
    <section id="features" className="py-12 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-20 px-2">
          <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-black mb-4 font-display mobile-text-balance">
            Why 1,000+ brands choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c8ff00] to-[#00d4aa]">CreatorX</span>
          </h2>
        </div>

        <div className="space-y-4 sm:space-y-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bgColor} rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 lg:p-14 flex flex-col lg:flex-row items-center gap-6 sm:gap-10 card-hover overflow-hidden relative`}
            >
              <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/10 rounded-full blur-3xl -mr-24 sm:-mr-48 -mt-24 sm:-mt-48"></div>
              
              <div className="flex-1 relative z-10 w-full">
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-black/10 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 backdrop-blur-sm">
                  Why CreatorX?
                </span>
                <h3 className={`text-2xl sm:text-4xl lg:text-5xl font-bold ${feature.textColor} mb-4 sm:mb-6 font-display`}>
                  {feature.title}
                </h3>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {feature.description.map((point, i) => (
                    <li key={i} className={`flex items-start gap-2 sm:gap-3 ${feature.textColor} text-sm sm:text-lg`}>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm sm:text-base"
                >
                  {feature.cta}
                </a>
              </div>

              <div className="flex-1 w-full max-w-lg relative z-10 hidden sm:block">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-4 sm:mb-5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500"></div>
                        <div className="flex-1">
                          <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-20 sm:w-24 mb-1.5 sm:mb-2"></div>
                          <div className="h-2 bg-gray-100 rounded w-14 sm:w-16"></div>
                        </div>
                        <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs rounded-full font-medium">
                          Active
                        </div>
                      </div>
                    ))}
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
