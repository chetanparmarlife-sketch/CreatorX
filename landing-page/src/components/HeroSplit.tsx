import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HeroSplit() {
  const [hoveredSide, setHoveredSide] = useState<"creator" | "brand" | null>(null);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden md:flex-row">
      {/* Creator Side */}
      <motion.div
        className={cn(
          "relative flex flex-1 flex-col justify-center overflow-hidden bg-black transition-all duration-700 ease-in-out",
          hoveredSide === "brand" ? "flex-[0.5] opacity-50 blur-sm" : "flex-1"
        )}
        onMouseEnter={() => setHoveredSide("creator")}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-orange-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
        
        <div className="relative z-10 flex flex-col items-start px-8 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-sm font-medium text-pink-400 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>For Creators</span>
          </motion.div>
          
          <motion.h2 
            className="mb-6 text-5xl font-bold font-space-grotesk tracking-tighter text-white md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Monetize <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
              Your <br />Influence
            </span>
          </motion.h2>
          
          <motion.p 
            className="mb-8 max-w-md text-lg text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Join elite brands, access exclusive campaigns, and get paid instantly. The platform built for the creator economy.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              href="/creator-app" 
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-black transition-all hover:bg-pink-500 hover:text-white"
            >
              Start Creating
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Brand Side */}
      <motion.div
        className={cn(
          "relative flex flex-1 flex-col justify-center overflow-hidden bg-black transition-all duration-700 ease-in-out",
          hoveredSide === "creator" ? "flex-[0.5] opacity-50 blur-sm" : "flex-1"
        )}
        onMouseEnter={() => setHoveredSide("brand")}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-600/20 via-purple-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />

        <div className="relative z-10 flex flex-col items-end px-8 md:px-16 lg:px-24 text-right">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-md"
          >
            <span>For Brands</span>
            <TrendingUp className="h-4 w-4" />
          </motion.div>

          <motion.h2 
            className="mb-6 text-5xl font-bold font-space-grotesk tracking-tighter text-white md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Scale With <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-500 to-purple-400">
              Authentic <br />Reach
            </span>
          </motion.h2>

          <motion.p 
            className="mb-8 max-w-md text-lg text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Discover top-tier creators, manage campaigns effortlessly, and drive real ROI with our AI-powered matchmaking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              href="/brand-dashboard" 
              className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black"
            >
              Launch Campaign
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Center Divider/Logo */}
      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block z-20 pointer-events-none">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-xl">
          <span className="text-2xl font-bold text-white">CX</span>
        </div>
      </div>
    </div>
  );
}
