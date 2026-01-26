const steps = [
  {
    title: "Share content requirement",
    description: "Create a brief in just 2 minutes post order placement. Describe your brand, creator, and content requirements and see creator applications roll in through our seamless UGC creator platform.",
  },
  {
    title: "Receive 2X creator options for your campaign",
    description: "Start receiving applications from relevant and genuinely interested creators once you share the campaign brief.",
  },
  {
    title: "Send product to selected creators",
    description: "Ship product or deliver service to creators for them to create high quality content as per your requirement.",
  },
  {
    title: "Review content received from creators",
    description: "Start receiving creator content within 3 days of product/service delivery. Approve content if you like it or share feedback to receive revised content.",
  },
  {
    title: "Track real-time performance",
    description: "Track campaign status and measure real time campaign performance with data directly from Instagram.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[#0f4c3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-[#c8ff00]">Easiest & super fast</span>
            <span className="text-white"> way to</span>
          </h2>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8">
            start and finish your campaign
          </h2>
          
          <div className="flex justify-center gap-4 mb-12">
            <button className="px-6 py-3 bg-white text-black rounded-full font-medium">
              Shipping Campaign
            </button>
            <button className="px-6 py-3 bg-white/10 text-white rounded-full font-medium border border-white/20">
              Non-Shipping Campaign
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`${index === 0 ? 'bg-white/10 border border-white/20' : ''} rounded-2xl p-6 transition-all hover:bg-white/10`}
              >
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                {index === 0 && (
                  <p className="text-white/70 text-sm">{step.description}</p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
              <span className="text-sm font-medium text-violet-600 border-b-2 border-violet-600 pb-2">1. About brand</span>
              <span className="text-sm text-gray-400">2. Creator preference</span>
              <span className="text-sm text-gray-400">3. Content guidelines</span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-4">About brand</h4>
                <p className="text-sm text-gray-600 mb-4">Tell us the brand name and tagline</p>
                <input 
                  type="text" 
                  placeholder="Enter brand name" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-4">Category of your product (select one)</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm">Fashion wear</span>
                  <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm">Innerwear</span>
                  <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm">Beauty and cosmetics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
