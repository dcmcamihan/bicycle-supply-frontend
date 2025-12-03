import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Bike, ArrowRight } from 'lucide-react';
import LoginForm from './components/LoginForm';
import LiquidBackground from '../../components/shared/LiquidBackground';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already authenticated, redirect
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [navigate, user]);

  const goHome = () => {
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Sign In - Jolens Bicycle Supply</title>
        <meta name="description" content="Sign in to Jolens Bicycle Supply management system. Access inventory, sales, and business analytics." />
        <meta name="keywords" content="bicycle shop, retail management, inventory, point of sale, login" />
      </Helmet>

      <div className="relative min-h-screen w-full overflow-hidden text-gray-100 font-sans selection:bg-emerald-500/30">
        <LiquidBackground />

        {/* Top Navigation */}
        <nav className="fixed top-0 z-50 w-full px-3 sm:px-6 py-3 sm:py-4">
          <div className="mx-auto max-w-7xl flex items-center justify-between rounded-full border border-white/10 bg-gray-900/50 px-3 sm:px-6 py-2 sm:py-3 backdrop-blur-xl shadow-lg gap-3">
            <button onClick={goHome} className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-500 text-black flex-shrink-0">
                <Bike size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-sm sm:text-lg font-bold tracking-tight text-white">
                Jolens<span className="text-emerald-400">.</span>
              </span>
            </button>
            <button 
              onClick={goHome}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition ml-auto"
            >
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
              <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">Welcome Back</h1>
              <p className="text-gray-400 text-base sm:text-lg">Sign in to your Jolen's account</p>
            </div>

            {/* Login Card */}
            <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 border border-emerald-500/20 backdrop-blur-sm shadow-2xl p-6 sm:p-8">
              {/* Decorative gradient */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-40 h-32 sm:h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <LoginForm />
              </div>
            </div>

            {/* Footer Text */}
            <p className="text-center text-gray-400 text-xs sm:text-sm mt-6">
              Don't have an account?{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
                Contact support
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;