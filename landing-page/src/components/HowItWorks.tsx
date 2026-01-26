"use client";

import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Share content requirement",
    description: "Create a brief in just 2 minutes. Describe your brand, creator, and content requirements.",
    icon: "📝",
  },
  {
    number: "02",
    title: "Receive 2X creator options",
    description: "Start receiving applications from relevant and genuinely interested creators.",
    icon: "👥",
  },
  {
    number: "03",
    title: "Send product to creators",
    description: "Ship product or deliver service to creators for high quality content.",
    icon: "📦",
  },
  {
    number: "04",
    title: "Review content received",
    description: "Receive creator content within 3 days. Approve or share feedback.",
    icon: "✅",
  },
  {
    number: "05",
    title: "Track real-time performance",
    description: "Track campaign status and measure performance with data from Instagram.",
    icon: "📊",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [campaignType, setCampaignType] = useState("shipping");

  return (
    <section id="how-it-works" className="py-12 sm:py-24 bg-gradient-to-br from-[#0f4c3a] via-[#134e3a] to-[#0d3d2e] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M20 20c0-5.5-4.5-10-10-10S0 14.5 0 20s4.5 10 10 10 10-4.5 10-10zm10 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z%22/%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 font-display mobile-text-balance">
            <span className="text-[#c8ff00]">Easiest & super fast</span>
            <span className="text-white"> way to</span>
          </h2>
          <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 sm:mb-10 font-display">
            start and finish your campaign
          </h2>
          
          <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-full p-1 sm:p-1.5">
            <button 
              onClick={() => setCampaignType("shipping")}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-xs sm:text-base ${campaignType === "shipping" ? "bg-white text-black shadow-lg" : "text-white hover:bg-white/10"}`}
            >
              Shipping Campaign
            </button>
            <button 
              onClick={() => setCampaignType("non-shipping")}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-xs sm:text-base ${campaignType === "non-shipping" ? "bg-white text-black shadow-lg" : "text-white hover:bg-white/10"}`}
            >
              Non-Shipping
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          <div className="space-y-3 sm:space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                onClick={() => setActiveStep(index)}
                className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-500 ${
                  activeStep === index 
                    ? 'bg-white/15 border border-[#c8ff00]/30 shadow-lg shadow-[#c8ff00]/10' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`text-2xl sm:text-3xl transition-transform duration-300 ${activeStep === index ? 'scale-110' : ''}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm sm:text-lg font-bold mb-1 sm:mb-2 transition-colors duration-300 font-display ${activeStep === index ? 'text-[#c8ff00]' : 'text-white'}`}>
                      {step.title}
                    </h3>
                    <div className={`overflow-hidden transition-all duration-500 ${activeStep === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 hidden lg:block">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
            </div>
            
            <div className="flex gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-gray-200 pb-3 sm:pb-4">
              <span className="text-xs sm:text-sm font-semibold text-violet-600 border-b-2 border-violet-600 pb-2 sm:pb-3">1. About brand</span>
              <span className="text-xs sm:text-sm text-gray-400">2. Creator preference</span>
              <span className="text-xs sm:text-sm text-gray-400">3. Content guidelines</span>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-display">About brand</h4>
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm">Tell us the brand name and tagline</p>
                <input 
                  type="text" 
                  placeholder="Enter brand name" 
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none transition-colors text-sm sm:text-base"
                />
              </div>
              <div>
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm">Category of your product</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className="px-4 sm:px-5 py-2 sm:py-2.5 bg-violet-100 text-violet-700 rounded-full text-xs sm:text-sm font-medium cursor-pointer hover:bg-violet-200 transition-colors">Fashion wear</span>
                  <span className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">Innerwear</span>
                  <span className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">Beauty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
