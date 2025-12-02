import React from 'react';
import { MapPin, Github, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative w-full border-t border-emerald-500/20 bg-gradient-to-b from-slate-900/50 to-black/80 backdrop-blur-xl">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
      
      <div className="w-full px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          {/* Main footer content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Company info */}
            <div className="col-span-1">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Jolen's Bicycle Supply</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Serving Digos City's cycling community with quality bikes, parts, and exceptional service since 2003.
              </p>
              <div className="flex items-center gap-2 mt-3 sm:mt-4 text-gray-400 text-xs sm:text-sm">
                <MapPin size={14} className="sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                <span>Digos City, Philippines</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-emerald-400 transition text-xs sm:text-sm">Home</a></li>
                <li><a href="#products" className="text-gray-400 hover:text-emerald-400 transition text-xs sm:text-sm">Products</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-emerald-400 transition text-xs sm:text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition text-xs sm:text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Follow Us</h4>
              <div className="flex gap-2 sm:gap-3">
                <a href="#" className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg p-2 sm:p-3 text-emerald-400 hover:text-emerald-300 transition duration-300">
                  <Github size={16} className="sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg p-2 sm:p-3 text-emerald-400 hover:text-emerald-300 transition duration-300">
                  <Twitter size={16} className="sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg p-2 sm:p-3 text-emerald-400 hover:text-emerald-300 transition duration-300">
                  <Linkedin size={16} className="sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg p-2 sm:p-3 text-emerald-400 hover:text-emerald-300 transition duration-300">
                  <Mail size={16} className="sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-6 sm:mb-8"></div>

          {/* Bottom footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2025 Jolen's Bicycle Supply. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm">
              <a href="#" className="text-gray-500 hover:text-emerald-400 transition">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-emerald-400 transition">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-emerald-400 transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
