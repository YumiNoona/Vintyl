"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HeroVisual() {
  return (
    <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-[#050505] shadow-2xl">
      {/* Abstract Background Shapes */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/30 blur-[120px] rounded-full"
      />
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -50, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-pink-600/20 blur-[120px] rounded-full"
      />

      {/* Hero Content Graphic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 w-[80%] aspect-video bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-indigo-500/10 shadow-2xl overflow-hidden"
      >
        <div className="flex gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        
        <div className="space-y-4">
          <motion.div 
            animate={{ width: ["40%", "90%", "40%"] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="h-2 bg-white/5 rounded-full" 
          />
          <div className="h-2 w-[85%] bg-white/5 rounded-full" />
          <div className="h-2 w-[60%] bg-white/5 rounded-full" />
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="h-32 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-purple-400/30 border-t-purple-400 animate-spin" />
            </div>
            <div className="h-32 rounded-xl bg-neutral-800/40 border border-white/5" />
          </div>
        </div>

        {/* Floating AI Badge */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-10 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-[10px] font-bold tracking-tighter shadow-lg"
        >
          AI POWERED
        </motion.div>
      </motion.div>

      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_70%)]" />
    </div>
  );
}
