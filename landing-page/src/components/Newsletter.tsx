"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail("");
    }
  };

  return (
    <section className="py-16 bg-black border-b border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-purple-600/10"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-white font-medium whitespace-nowrap text-lg">Subscribe to our newsletter</span>
          <div className="flex-1 flex w-full relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 bg-white/10 border-2 border-white/20 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c8ff00] transition-colors"
            />
            <button 
              type="submit"
              className="px-8 py-4 bg-white text-black font-bold rounded-r-xl hover:bg-[#c8ff00] transition-all duration-300"
            >
              {isSubmitted ? "✓ Subscribed!" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
