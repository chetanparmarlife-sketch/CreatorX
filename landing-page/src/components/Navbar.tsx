"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#c8ff00] transition-colors duration-300 font-display">CreatorX</span>
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="/creator-signup" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Sign up as a creator</a>
            <a href="/blogs" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Blogs & case studies</a>
            <a href="/book-demo" className="text-[#c8ff00] hover:text-white transition-colors duration-300 flex items-center gap-2 font-medium text-sm">
              Book a demo
              <span className="animate-pulse">✦</span>
            </a>
          </div>

          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <a
              href="/login"
              className="px-4 py-2 sm:px-5 sm:py-2.5 text-white border border-white/30 rounded-full hover:bg-white hover:text-black transition-all duration-300 font-medium text-sm"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-black rounded-full hover:bg-[#c8ff00] transition-all duration-300 font-medium text-sm hover:shadow-lg hover:shadow-[#c8ff00]/20"
            >
              Sign Up
            </a>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden bg-black/95 backdrop-blur-lg border-t border-white/10 py-4">
            <div className="flex flex-col gap-4">
              <a href="/creator-signup" className="text-gray-300 hover:text-white px-4 py-2 text-sm">Sign up as a creator</a>
              <a href="/blogs" className="text-gray-300 hover:text-white px-4 py-2 text-sm">Blogs & case studies</a>
              <a href="/book-demo" className="text-[#c8ff00] px-4 py-2 text-sm font-medium">Book a demo ✦</a>
              <div className="flex gap-2 px-4 pt-2">
                <a href="/login" className="flex-1 text-center py-2.5 border border-white/30 rounded-full text-white text-sm">Login</a>
                <a href="/signup" className="flex-1 text-center py-2.5 bg-white text-black rounded-full text-sm font-medium">Sign Up</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
