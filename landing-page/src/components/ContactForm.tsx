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
    <section className="py-24 bg-[#c8ff00] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#b8ef00] rounded-full blur-3xl opacity-50 -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#a0d900] rounded-full blur-3xl opacity-50 -ml-48 -mb-48"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-[2rem] p-10 lg:p-14 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <p className="text-violet-200 text-lg mb-10 font-medium">CreatorX</p>
              <h3 className="text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
                Join 1000+ brands already working with us.
              </h3>
              
              <div className="relative inline-block">
                <div className="w-28 h-28 bg-black rounded-full flex flex-col items-center justify-center shadow-2xl animate-float">
                  <span className="text-white font-bold text-3xl">3X</span>
                  <span className="text-white/80 text-sm">ROAS</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#c8ff00] rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">↗</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-2xl">
            <h3 className="text-2xl lg:text-3xl font-bold text-black mb-3">
              Choose the power that fits you best
            </h3>
            <p className="text-gray-600 mb-2">Good things happen to those who wait.</p>
            <p className="text-gray-600 mb-6">Great things happen to those who <span className="text-violet-600 font-semibold">connect</span>.</p>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              With our UGC creation platform for brands, you get effortless access to authentic creators who help elevate your content strategy.
            </p>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900"
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900"
              />
              <input
                type="text"
                placeholder="Enter your company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900"
              />
              <select 
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-500"
              >
                <option value="">Company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
              <input
                type="text"
                placeholder="Enter your website/business page"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900"
              />
              <div className="flex">
                <select className="px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-l-xl focus:outline-none text-gray-600 border-r-0">
                  <option>🇮🇳 +91</option>
                </select>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="flex-1 px-5 py-4 bg-gray-50 border-2 border-gray-100 border-l-0 rounded-r-xl focus:outline-none focus:border-violet-500 transition-colors text-gray-900"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-lg"
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
