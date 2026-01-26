"use client";

import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">CreatorX</span>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="/creator-signup" className="text-gray-300 hover:text-white transition-colors">Sign up as a creator</a>
            <a href="/blogs" className="text-gray-300 hover:text-white transition-colors">Blogs & case studies</a>
            <a href="/book-demo" className="text-[#c8ff00] hover:text-[#a3cc00] font-medium transition-colors flex items-center gap-1">
              Book a demo
              <span className="text-xs">✨</span>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-5 py-2 text-white border border-white/30 rounded-full hover:bg-white/10 transition-all font-medium"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-5 py-2 bg-white text-black rounded-full hover:bg-gray-100 transition-all font-medium"
            >
              Sign Up
            </a>
          </div>

          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <a href="/creator-signup" className="text-gray-300 hover:text-white">Sign up as a creator</a>
              <a href="/blogs" className="text-gray-300 hover:text-white">Blogs & case studies</a>
              <a href="/book-demo" className="text-[#c8ff00]">Book a demo</a>
              <hr className="border-white/10" />
              <a href="/login" className="text-white">Login</a>
              <a
                href="/signup"
                className="px-5 py-2 bg-white text-black rounded-full text-center font-medium"
              >
                Sign Up
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
