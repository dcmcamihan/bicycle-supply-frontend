import React from 'react';
import { motion } from 'framer-motion';
import { History, Heart, Zap } from 'lucide-react';
import LiquidBackground from '../../components/shared/LiquidBackground';
import Navigation from '../../components/shared/Navigation';
import TechMarquee from '../../components/shared/TechMarquee';
import HeroSection from './components/HeroSection';
import FeatureGrid from './components/FeatureGrid';
import Footer from './components/Footer';
import Carousel from '../../components/shared/Carousel';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden text-gray-100 font-sans selection:bg-emerald-500/30 flex flex-col">
      <LiquidBackground />

      <Navigation currentView="landing" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex-1 pt-32"
      >
        <section id="home">
          <HeroSection onGetStarted={handleGetStarted} />
        </section>

        <div className="mb-24">
          <TechMarquee />
        </div>

        <section id="products">
          <FeatureGrid />
        </section>

        <section id="about" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-5xl font-bold text-white mb-4">About Us</h2>
              <p className="text-gray-400 text-lg max-w-3xl">
                Serving Digos City's cycling community with passion and reliability
              </p>
            </div>
            <div className="flex justify-center">
              <Carousel
                items={[
                  {
                    title: 'Our History',
                    description: "Serving Digos City's cycling community since 2003, Jolen's Bicycle Supply has grown from a small neighborhood shop into a trusted destination for quality bicycles, parts, and accessories.",
                    icon: <History className="w-6 h-6" />,
                    id: 1
                  },
                  {
                    title: 'Our Commitment',
                    description: "For over two decades, we've supported riders of all ages—from children learning their first bike to seasoned cyclists upgrading their gear. We take pride in offering reliable products and honest service.",
                    icon: <Heart className="w-6 h-6" />,
                    id: 2
                  },
                  {
                    title: 'Our Promise',
                    description: "With a wide selection of bikes, replacement parts, and cycling essentials, we're committed to keeping every ride smooth, safe, and enjoyable. Jolen's continues to bring in new products from trusted suppliers.",
                    icon: <Zap className="w-6 h-6" />,
                    id: 3
                  }
                ]}
                baseWidth={620}
                autoplay={true}
                autoplayDelay={3000}
                pauseOnHover={true}
                loop={true}
              />
            </div>
          </div>
        </section>
      </motion.div>

      <Footer />
    </div>
  );
};

export default LandingPage;
