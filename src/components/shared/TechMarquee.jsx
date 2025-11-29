import React from 'react';
import { Star } from 'lucide-react';

const TechMarquee = () => {
  const items = [
    "SHIMANO", "SAGMIT", "LEO", "MAXZONE", "RAGUSA", "KENDA", "KRONOS"
  ];
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative flex w-full overflow-hidden border-y border-white/5 bg-black/20 py-4 backdrop-blur-sm">
      <div className="flex animate-marquee whitespace-nowrap">
        {duplicatedItems.map((item, idx) => (
          <div key={idx} className="mx-8 flex items-center space-x-2 text-sm font-bold tracking-widest text-emerald-500/70">
            <Star size={12} className="text-yellow-500" fill="currentColor" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-900 to-transparent"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-900 to-transparent"></div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TechMarquee;
