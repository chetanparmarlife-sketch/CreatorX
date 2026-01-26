"use client";

import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">CX</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CreatorX</span>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#platforms" className="text-gray-600 hover:text-indigo-600 transition-colors">Platform</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="/brand-login"
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Brand Login
            </a>
            <a
              href="/creator-app"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Join as Creator
            </a>
          </div>

          <button
            className="md:hidden p-2"
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
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 hover:text-indigo-600">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600">How it Works</a>
              <a href="#platforms" className="text-gray-600 hover:text-indigo-600">Platform</a>
              <hr className="border-gray-200" />
              <a href="/brand-login" className="text-gray-700 font-medium">Brand Login</a>
              <a
                href="/creator-app"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-full text-center"
              >
                Join as Creator
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
