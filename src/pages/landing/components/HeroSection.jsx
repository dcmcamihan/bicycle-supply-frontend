import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const HeroSection = ({ onGetStarted }) => {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="mb-20 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
        >
          <Trophy size={14} />
          <span className="hidden sm:inline">Trusted Bicycle Shop in Digos City</span>
          <span className="sm:hidden">Trusted Shop</span>
        </motion.div>
        <h1 className="mb-6 text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl">
          Ride the <span className="bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">Future.</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Own the Road.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-400 px-2">
          Premium bicycles, top-tier gears, and expert components. Experience the next generation of cycling with Jolen's Bicycle Supply.
        </p>
        
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
          <button 
            onClick={onGetStarted}
            className="relative h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold overflow-hidden w-full sm:w-auto
                        shadow-lg shadow-emerald-500/30 transition-all duration-300 
                        hover:shadow-xl hover:shadow-emerald-500/40 
                        hover:scale-105 hover:bg-emerald-700
                        active:shadow-none active:translate-y-0.5"
          >
            <span className="relative z-10">Get Started</span>
          </button>
          
          <button className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-gray-700/50 border border-white/20 text-gray-300 font-semibold backdrop-blur-md transition-all duration-300 hover:bg-gray-600/60 hover:text-white hover:border-emerald-400/50 hover:scale-105 w-full sm:w-auto">
            View Catalog
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
