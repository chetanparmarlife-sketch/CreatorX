const steps = [
  {
    number: "01",
    title: "Share Content Requirements",
    description: "Create a brief in just 2 minutes. Describe your brand, creator, and content requirements and see creator applications roll in.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Receive 2X Creator Options",
    description: "Start receiving applications from relevant and genuinely interested creators once you share the campaign brief.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Send Products to Creators",
    description: "Ship product or deliver service to creators for them to create high quality content as per your requirement.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Review Content",
    description: "Start receiving creator content within 3 days. Approve content if you like it or share feedback to receive revised content.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Track Performance",
    description: "Track campaign status and measure real-time campaign performance with data directly from social platforms.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">How It Works</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
            Easiest & super fast way to run campaigns
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Start and finish your campaign in just 5 simple steps
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 transform -translate-x-1/2"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={`flex-1 ${index % 2 === 1 ? "lg:text-right" : ""}`}>
                  <div className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-100 ${index % 2 === 1 ? "lg:ml-auto" : ""} max-w-lg`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        {step.icon}
                      </div>
                      <span className="text-4xl font-bold text-indigo-100">{step.number}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                <div className="hidden lg:flex w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                  {index + 1}
                </div>

                <div className="flex-1 hidden lg:block"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="/brand-signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-indigo-500/30 transition-all text-lg"
          >
            Start Your Campaign
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
