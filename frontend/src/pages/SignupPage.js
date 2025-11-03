import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Film, Loader, AlertCircle, Check, Shield, Star, Users, Heart, ArrowRight, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const { t } = useTranslation();
  const { signup, loginWithGoogle, currentUser, authError, clearError } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showTooltip, setShowTooltip] = useState(null);
  const [typingTimer, setTypingTimer] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const features = [
    {
      icon: <Film className="w-8 h-8 text-cinema-blue" />,
      title: "Personal Movie Collection",
      description: "Build and manage your digital movie library"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "Rate & Review",
      description: "Share your thoughts on movies you've watched"
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: "Connect with Friends",
      description: "Follow friends and see their movie recommendations"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Personalized Recommendations",
      description: "Get movie suggestions based on your preferences"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  if (currentUser) {
    return <Navigate to="/" />;
  }

  const validateForm = () => {
    const errors = {};

    if (!formData.displayName.trim()) {
      errors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    } else if (formData.displayName.trim().length > 50) {
      errors.displayName = 'Display name must be less than 50 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    setIsTyping(true);
    if (typingTimer) clearTimeout(typingTimer);
    
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    setTypingTimer(timer);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.displayName);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google signup error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, label: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score < 3) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (score < 5) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  const resetForm = () => {
    setFormData({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    clearError();
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-cinema-darker">
      <div 
        className="absolute inset-0 bg-center bg-cover opacity-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1588823400943-b85ba1a6d19a')`
        }}
      />
      
      <div className="relative z-10 flex w-full max-w-6xl gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 hidden lg:block"
        >
          <div className="p-8 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-2xl">
            <div className="mb-8">
              <h2 className="mb-4 text-3xl font-bold text-white">Welcome to SAYN</h2>
              <p className="text-gray-300">Join thousands of movie enthusiasts building their digital collections</p>
            </div>

            <div className="mb-8">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-6 border rounded-xl bg-white/5 border-white/10"
              >
                <div className="flex items-center mb-4 space-x-3">
                  {features[currentFeature].icon}
                  <h3 className="text-xl font-semibold text-white">
                    {features[currentFeature].title}
                  </h3>
                </div>
                <p className="text-gray-300">
                  {features[currentFeature].description}
                </p>
              </motion.div>

              <div className="flex justify-center mt-4 space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentFeature ? 'bg-cinema-blue' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg bg-white/5 border-white/10">
                <div className="text-2xl font-bold text-cinema-blue">10K+</div>
                <div className="text-sm text-gray-400">Movies</div>
              </div>
              <div className="p-4 border rounded-lg bg-white/5 border-white/10">
                <div className="text-2xl font-bold text-green-500">5K+</div>
                <div className="text-sm text-gray-400">Users</div>
              </div>
              <div className="p-4 border rounded-lg bg-white/5 border-white/10">
                <div className="text-2xl font-bold text-yellow-500">50K+</div>
                <div className="text-sm text-gray-400">Reviews</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 max-w-md mx-auto lg:mx-0"
        >
          <div className="p-8 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-2xl">
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center mb-4 space-x-3"
              >
                <Film className="w-10 h-10 text-cinema-blue" />
                <h1 className="text-3xl font-bold text-white">SAYN</h1>
              </motion.div>
              <h2 className="mb-2 text-xl text-gray-300">Create Account</h2>
              <p className="text-gray-400">Join SAYN to start building your movie collection</p>
            </div>

            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-4 mb-6 border rounded-lg bg-green-500/20 border-green-500/30"
              >
                <div className="flex items-center space-x-3">
                  <Check className="flex-shrink-0 w-5 h-5 text-green-400" />
                  <p className="text-sm text-green-300">Account created successfully!</p>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-green-400 hover:text-green-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {authError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-4 mb-6 border rounded-lg bg-red-500/20 border-red-500/30"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-400" />
                  <p className="text-sm text-red-300">{authError}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <motion.button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              whileHover={{ scale: googleLoading ? 1 : 1.02 }}
              whileTap={{ scale: googleLoading ? 1 : 0.98 }}
              className="flex items-center justify-center w-full py-3 mb-6 space-x-3 font-semibold text-white transition-all border rounded-lg bg-white/10 border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing up with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">
                  Display Name
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-blue focus:border-transparent transition-all ${
                      formErrors.displayName ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your display name"
                    onMouseEnter={() => setShowTooltip('displayName')}
                    onMouseLeave={() => setShowTooltip(null)}
                  />
                  {showTooltip === 'displayName' && (
                    <div className="absolute z-10 p-2 text-xs text-white bg-black rounded-lg shadow-lg -top-10 left-3">
                      This will be your public display name
                    </div>
                  )}
                </div>
                {formErrors.displayName && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.displayName}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">
                  Email Address
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-blue focus:border-transparent transition-all ${
                      formErrors.email ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your email"
                  />
                  {isTyping && formData.email && (
                    <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                      <Loader className="w-4 h-4 animate-spin text-cinema-blue" />
                    </div>
                  )}
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">
                  Password
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-blue focus:border-transparent transition-all ${
                      formErrors.password ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Must contain: uppercase, lowercase, and number
                    </div>
                  </div>
                )}
                
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">
                  Confirm Password
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-blue focus:border-transparent transition-all ${
                      formErrors.confirmPassword ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  
                  {formData.confirmPassword && (
                    <div className="absolute transform -translate-y-1/2 right-12 top-1/2">
                      {formData.password === formData.confirmPassword ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-1 rounded bg-white/10 border-white/20 text-cinema-blue focus:ring-cinema-blue focus:ring-2"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="#" className="text-cinema-blue hover:text-cinema-blue/80">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-cinema-blue hover:text-cinema-blue/80">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="button"
                  onClick={resetForm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center px-6 py-3 space-x-2 font-semibold text-gray-300 transition-colors border rounded-lg border-white/20 hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex items-center justify-center flex-1 py-3 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium transition-colors text-cinema-blue hover:text-cinema-blue/80"
                >
                  Sign In
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-center mt-6 space-x-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Your data is protected with enterprise-grade security</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;