import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.username) newErrors.username = 'Username is required';
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await login(formData.username, formData.password);
      if (formData.rememberMe) localStorage.setItem('rememberMe', 'true');
      navigate('/dashboard');
    } catch (e) {
      let details = '';
      if (e?.response) {
        details = JSON.stringify(e.response.data, null, 2);
      } else if (e?.message) {
        details = e.message;
      } else if (typeof e === 'string') {
        details = e;
      }
      setErrors({ general: e?.message || 'Login failed', details });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Message */}
        {errors?.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm"
          >
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium text-sm">{errors?.general}</p>
              {errors?.details && (
                <pre className="text-red-400/70 font-mono text-xs mt-2 whitespace-pre-wrap break-words max-h-24 overflow-y-auto">{errors.details}</pre>
              )}
            </div>
          </motion.div>
        )}

        {/* Username Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData?.username}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                errors?.username 
                  ? 'border-red-500/50' 
                  : 'border-emerald-500/20 hover:border-emerald-500/40'
              } text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all duration-200 backdrop-blur-sm`}
            />
          </div>
          {errors?.username && (
            <p className="text-red-400 text-xs mt-1">{errors?.username}</p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData?.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                errors?.password 
                  ? 'border-red-500/50' 
                  : 'border-emerald-500/20 hover:border-emerald-500/40'
              } text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all duration-200 backdrop-blur-sm pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
          {errors?.password && (
            <p className="text-red-400 text-xs mt-1">{errors?.password}</p>
          )}
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData?.rememberMe}
            onChange={handleInputChange}
            disabled={isLoading}
            size="sm"
          />
          
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </motion.div>

        {/* Sign In Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-emerald-500/50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default LoginForm;