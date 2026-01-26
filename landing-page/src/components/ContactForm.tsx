"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    size: "",
    website: "",
    phone: "",
  });

  return (
    <section className="py-12 sm:py-24 bg-[#c8ff00] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-[#b8ef00] rounded-full blur-3xl opacity-50 -mr-24 sm:-mr-48 -mt-24 sm:-mt-48"></div>
      <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-[#a0d900] rounded-full blur-3xl opacity-50 -ml-24 sm:-ml-48 -mb-24 sm:-mb-48"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-2xl -mr-16 sm:-mr-32 -mt-16 sm:-mt-32"></div>
            
            <div className="relative z-10">
              <p className="text-violet-200 text-base sm:text-lg mb-6 sm:mb-10 font-medium font-display">CreatorX</p>
              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight font-display">
                Join 1000+ brands already working with us.
              </h3>
              
              <div className="relative inline-block">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-black rounded-full flex flex-col items-center justify-center shadow-2xl animate-float">
                  <span className="text-white font-bold text-2xl sm:text-3xl">3X</span>
                  <span className="text-white/80 text-xs sm:text-sm">ROAS</span>
                </div>
                <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-[#c8ff00] rounded-full flex items-center justify-center">
                  <span className="text-black text-base sm:text-xl">↗</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 shadow-2xl">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-2 sm:mb-3 font-display">
              Choose the power that fits you best
            </h3>
            <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">Good things happen to those who wait.</p>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Great things happen to those who <span className="text-violet-600 font-semibold">connect</span>.</p>
            <p className="text-gray-500 mb-6 sm:mb-8 text-xs sm:text-sm leading-relaxed">
              Get effortless access to authentic creators who help elevate your content strategy.
            </p>

            <form className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900 text-sm sm:text-base"
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900 text-sm sm:text-base"
              />
              <input
                type="text"
                placeholder="Enter your company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900 text-sm sm:text-base"
              />
              <select 
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-500 text-sm sm:text-base"
              >
                <option value="">Company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
              <input
                type="text"
                placeholder="Enter your website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900 text-sm sm:text-base"
              />
              <div className="flex">
                <select className="px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-l-lg sm:rounded-l-xl focus:outline-none text-gray-600 border-r-0 text-sm sm:text-base">
                  <option>🇮🇳 +91</option>
                </select>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="flex-1 px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 border-l-0 rounded-r-lg sm:rounded-r-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900 text-sm sm:text-base"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 sm:py-4 bg-black text-white font-bold rounded-lg sm:rounded-xl hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-base sm:text-lg"
              >
                Get Started Free
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
