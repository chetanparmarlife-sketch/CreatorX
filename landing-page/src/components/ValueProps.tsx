"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const props = [
  { text: "Starting at just ₹2900*" },
  { text: "Setup takes 30 seconds" },
  { text: "No subscription fees" },
  { text: "Content within 72 hours" },
  { text: "Save up to 30%" },
];

export default function ValueProps() {
  return (
    <section className="py-6 bg-black border-y border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {props.map((prop, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 text-white group cursor-default"
            >
              <Zap className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="font-space-grotesk font-medium text-sm md:text-base text-gray-300 group-hover:text-white transition-colors">
                {prop.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
