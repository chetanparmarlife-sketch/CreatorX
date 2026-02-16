"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

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
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold text-white tracking-tighter font-space-grotesk group-hover:text-pink-500 transition-colors duration-300">
              Creator<span className="text-blue-500 group-hover:text-blue-400">X</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/marketplace" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/success-stories" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Stories
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-white hover:text-pink-400 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="group relative px-6 py-2.5 rounded-full overflow-hidden bg-white text-black text-sm font-bold transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <span>Get Started</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-6">
              <Link href="/about" className="text-lg font-medium text-gray-300 hover:text-white">About</Link>
              <Link href="/marketplace" className="text-lg font-medium text-gray-300 hover:text-white">Marketplace</Link>
              <Link href="/success-stories" className="text-lg font-medium text-gray-300 hover:text-white">Stories</Link>
              <hr className="border-white/10 my-2" />
              <div className="flex flex-col gap-3">
                <Link href="/login" className="text-center py-3 border border-white/20 rounded-full text-white font-medium hover:bg-white/5">
                  Login
                </Link>
                <Link href="/signup" className="text-center py-3 bg-white text-black rounded-full font-bold hover:bg-gray-100">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
