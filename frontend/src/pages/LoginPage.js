import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Film, Loader, AlertCircle, CheckCircle, X, Github, Facebook} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login, loginWithGoogle, currentUser, authError, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [capsLockWarning, setCapsLockWarning] = useState(false);

  const backgroundImages = [
    'https://images.unsplash.com/photo-1588823400943-b85ba1a6d19a',
    'https://images.unsplash.com/photo-1489599735733-58b7f1ee7e4c',
    'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96'
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = t('auth.invalidEmail');
    }
    
    if (formData.password && formData.password.length < 6) {
      errors.password = t('auth.passwordTooShort');
    }
    
    setValidationErrors(errors);
    setIsFormValid(formData.email && formData.password && Object.keys(errors).length === 0);
  }, [formData, t]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleKeyPress = (e) => {
    const capsLockOn = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockWarning(capsLockOn);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      setForgotPasswordSuccess(true);
      setTimeout(() => {
        setForgotPasswordSuccess(false);
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      }, 3000);
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@sayn.com',
      password: 'demo123'
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden bg-gray-900">
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url('${image}')` }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentBgIndex ? 0.15 : 0 
            }}
            transition={{ duration: 1.5 }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cinema-blue/20"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100, null],
              x: [null, Math.random() * 100 - 50, null],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed z-50 flex items-center px-6 py-3 space-x-2 text-white bg-green-500 rounded-lg shadow-lg top-4 right-4"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Successfully logged in!</span>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="p-8 border shadow-2xl bg-black/20 backdrop-blur-sm border-white/20 rounded-2xl">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="flex items-center justify-center mb-4 space-x-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Film className="w-10 h-10 text-blue-500" />
              </motion.div>
              <h1 className="text-3xl font-bold text-transparent text-white bg-gradient-to-r from-blue-500 to-purple-400 bg-clip-text">
                SAYN
              </h1>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-2 text-xl text-gray-300"
            >
              {t('auth.loginTitle')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400"
            >
              Sign in to access your movie collection
            </motion.p>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center p-4 mb-6 space-x-3 border rounded-lg bg-red-500/20 border-red-500/30"
            >
              <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-400" />
              <p className="text-sm text-red-300">{authError}</p>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {showForgotPassword && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 mb-6 border rounded-lg bg-blue-500/20 border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Reset Password</h3>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {forgotPasswordSuccess ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Password reset email sent!</span>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cinema-blue"
                    required
                  />
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex items-center justify-center w-full py-2 space-x-2 font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {forgotPasswordLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              whileHover={{ scale: googleLoading || loading ? 1 : 1.05 }}
              whileTap={{ scale: googleLoading || loading ? 1 : 0.95 }}
              className="flex items-center justify-center py-3 font-semibold text-red-400 transition-colors border rounded-lg bg-red-500/20 border-red-500/30 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
            </motion.button>
            
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center py-3 font-semibold text-gray-400 transition-colors border rounded-lg bg-gray-700/20 border-gray-600/30 hover:bg-gray-700/30"
            >
              <Github className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center py-3 font-semibold text-blue-400 transition-colors border rounded-lg bg-blue-600/20 border-blue-600/30 hover:bg-blue-600/30"
            >
              <Facebook className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400 bg-black/60">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                {t('common.email')}
              </label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    validationErrors.email ? 'border-red-500' : 'border-white/20'
                  }`"
                  placeholder={t('auth.emailPlaceholder')}
                />
                {validationErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-400"
                  >
                    {validationErrors.email}
                  </motion.p>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                {t('common.password')}
              </label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    validationErrors.password ? 'border-red-500' : 'border-white/20'
                  }`"
                  placeholder={t('auth.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {validationErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-400"
                  >
                    {validationErrors.password}
                  </motion.p>
                )}
                {capsLockWarning && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-yellow-400"
                  >
                    ⚠️ Caps Lock is on
                  </motion.p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded bg-white/10 border-white/20 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={!isFormValid || loading || googleLoading}
              whileHover={{ scale: !isFormValid || loading || googleLoading ? 1 : 1.02 }}
              whileTap={{ scale: !isFormValid || loading || googleLoading ? 1 : 0.98 }}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                isFormValid && !loading && !googleLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>{t('common.login')}</span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link
                to="/signup"
                className="font-medium text-blue-500 transition-colors hover:text-blue-400"
              >
                {t('auth.signUpLink')}
              </Link>
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-4 mt-6 border rounded-lg bg-blue-500/10 border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-500">Demo Credentials:</p>
              <motion.button
                onClick={fillDemoCredentials}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 text-xs text-blue-500 transition-colors border rounded bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
              >
                Quick Fill
              </motion.button>
            </div>
            <p className="text-xs text-gray-300">Email: demo@sayn.com</p>
            <p className="text-xs text-gray-300">Password: demo123</p>
          </motion.div>

          <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-gray-500">
            <span>🔒 Secure Login</span>
            <span>•</span>
            <span>🌐 Multi-Language</span>
            <span>•</span>
            <span>📱 Mobile Friendly</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;