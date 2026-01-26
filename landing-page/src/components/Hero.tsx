"use client";

import { useEffect, useState } from "react";

const creatorImages = [
  { bg: "from-emerald-400 to-teal-600", name: "Priya", followers: "125K" },
  { bg: "from-pink-400 to-rose-600", name: "Rahul", followers: "89K" },
  { bg: "from-violet-400 to-purple-600", name: "Sneha", followers: "210K" },
  { bg: "from-amber-400 to-orange-600", name: "Arjun", followers: "156K" },
  { bg: "from-cyan-400 to-blue-600", name: "Ananya", followers: "178K" },
  { bg: "from-lime-400 to-green-600", name: "Vikram", followers: "92K" },
];

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="bg-gradient-to-b from-black via-black to-gray-900 pt-28 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center animate-float shadow-lg shadow-purple-500/30">
              <span className="text-white text-xl">✦</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Get ready to{" "}
            <span className="gradient-text text-shadow-glow">Amplify</span>
            <br className="hidden sm:block" />
            {" "}your brand
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-10 animate-fade-in-up-delay-1">
            Match with creators in minutes
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 animate-fade-in-up-delay-2">
            <a
              href="/signup"
              className="btn-hover inline-block px-10 py-4 bg-[#c8ff00] text-black font-bold rounded-full text-lg animate-pulse-glow"
            >
              Sign up for free
            </a>
            <a
              href="/book-demo"
              className="btn-hover inline-block px-10 py-4 bg-transparent text-white font-semibold rounded-full text-lg border-2 border-white/30 hover:border-white/60"
            >
              Book a demo
            </a>
          </div>

          <p className="text-sm text-gray-500 animate-fade-in-up-delay-3">No credit card required</p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none"></div>
          <div className="flex justify-center gap-4 sm:gap-6 overflow-x-auto pb-8 scrollbar-hide">
            {creatorImages.map((creator, index) => (
              <div
                key={index}
                className={`w-36 h-52 sm:w-44 sm:h-64 rounded-2xl bg-gradient-to-br ${creator.bg} flex-shrink-0 shadow-2xl card-hover relative overflow-hidden group`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 to-transparent"></div>
                
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
                  </svg>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm"></div>
                    <div>
                      <p className="text-white font-semibold text-sm">{creator.name}</p>
                      <p className="text-white/70 text-xs">{creator.followers} followers</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/60 rounded-full" style={{ width: `${60 + index * 5}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
