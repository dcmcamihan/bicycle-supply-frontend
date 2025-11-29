import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, ArrowRight } from 'lucide-react';

const Navigation = ({ currentView, onViewChange }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');

  const handleLoginClick = () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      setActiveSection(sectionId);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'products', 'about'];
      let currentActive = 'home';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            currentActive = section;
          }
        }
      }

      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (section) => activeSection === section;

  return (
    <nav className="fixed top-0 z-50 w-full px-6 py-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between rounded-full border border-white/10 bg-gray-900/50 px-6 py-3 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black">
              <Bike size={20} strokeWidth={2.5} />
           </div>
           <span className="text-lg font-bold tracking-tight text-white">
             Jolens<span className="text-emerald-400">.</span>
           </span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => scrollToSection('home')}
            className={`text-sm font-medium transition ${isActive('home') ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('products')}
            className={`text-sm font-medium transition hidden md:block cursor-pointer ${isActive('products') ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
          >
            Products & Services
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className={`text-sm font-medium transition hidden md:block cursor-pointer ${isActive('about') ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
          >
            About
          </button>
          <button 
            onClick={handleLoginClick}
            className="group relative overflow-hidden rounded-full bg-emerald-500 px-6 py-2 text-sm font-bold text-gray-900 transition hover:bg-emerald-400"
          >
            <span className="relative z-10 flex items-center gap-2">
              Login <ArrowRight size={14} />
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
