"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-lg border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-bold text-white group-hover:text-[#c8ff00] transition-colors duration-300">CreatorX</span>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="/creator-signup" className="text-gray-300 hover:text-white transition-colors duration-300">Sign up as a creator</a>
            <a href="/blogs" className="text-gray-300 hover:text-white transition-colors duration-300">Blogs & case studies</a>
            <a href="/book-demo" className="text-[#c8ff00] hover:text-white transition-colors duration-300 flex items-center gap-2 font-medium">
              Book a demo
              <span className="animate-pulse">✦</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="px-5 py-2.5 text-white border border-white/30 rounded-full hover:bg-white hover:text-black transition-all duration-300 font-medium"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-5 py-2.5 bg-white text-black rounded-full hover:bg-[#c8ff00] transition-all duration-300 font-medium hover:shadow-lg hover:shadow-[#c8ff00]/20"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
