import React from 'react';
import { MapPin, Github, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative w-full border-t border-emerald-500/20 bg-gradient-to-b from-slate-900/50 to-black/80 backdrop-blur-xl">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
      
      <div className="w-full px-6 py-16">
        <div className="mx-auto max-w-7xl">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Company info */}
            <div className="col-span-1">
              <h3 className="text-white font-bold text-lg mb-4">Jolen's Bicycle Supply</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Serving Digos City's cycling community with quality bikes, parts, and exceptional service since 2003.
              </p>
              <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
                <MapPin size={16} className="text-emerald-500" />
                <span>Digos City, Philippines</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-emerald-400 transition text-sm">Home</a></li>
                <li><a href="#products" className="text-gray-400 hover:text-emerald-400 transition text-sm">Products</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-emerald-400 transition text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="col-span-1">
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg p-3 text-emerald-400 hover:text-emerald-300 transition duration-300">
                  <Github size={18} />
                </a>
                <a href="#" className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg p-3 text-emerald-400 hover:text-emerald-300 transition duration-300">
                  <Twitter size={18} />
                </a>
                <a href="#" className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg p-3 text-emerald-400 hover:text-emerald-300 transition duration-300">
                  <Linkedin size={18} />
                </a>
                <a href="#" className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg p-3 text-emerald-400 hover:text-emerald-300 transition duration-300">
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-8"></div>

          {/* Bottom footer */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2025 Jolen's Bicycle Supply. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0 text-sm">
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
