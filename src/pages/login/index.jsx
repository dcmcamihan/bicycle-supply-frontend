import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import LoginBackground from './components/LoginBackground';

const LoginPage = () => {
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Sign In - Jolens BikeShop</title>
        <meta name="description" content="Sign in to Jolens BikeShop retail management system. Access inventory management, point of sale, and business analytics for your bicycle shop." />
        <meta name="keywords" content="bicycle shop, retail management, inventory, point of sale, login" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 lg:flex-none lg:w-96 xl:w-[480px]">
          <div className="mx-auto w-full max-w-md lg:max-w-sm xl:max-w-md">
            <LoginHeader />
            <div className="bg-card rounded-2xl shadow-raised border border-border p-8">
              <LoginForm />
            </div>
            <SecurityBadges />
          </div>
        </div>

        {/* Right Side - Background Image (Desktop Only) */}
        <LoginBackground />
      </div>
    </>
  );
};

export default LoginPage;