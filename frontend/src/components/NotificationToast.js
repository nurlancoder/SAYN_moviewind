import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X, Pause, Play, RotateCcw } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const showToast = (message, type = 'info', duration = 4000, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = { 
      id, 
      message, 
      type, 
      duration,
      persistent: options.persistent || false,
      action: options.action || null,
      createdAt: Date.now(),
      remainingTime: duration
    };
        
    setToasts(prev => [...prev, toast]);
        
    if (!toast.persistent && duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
        
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const pauseToasts = () => {
    setIsPaused(true);
  };

  const resumeToasts = () => {
    setIsPaused(false);
  };

  const success = (message, duration, options) => showToast(message, 'success', duration, options);
  const error = (message, duration, options) => showToast(message, 'error', duration, options);
  const warning = (message, duration, options) => showToast(message, 'warning', duration, options);
  const info = (message, duration, options) => showToast(message, 'info', duration, options);
  
  const loading = (message, options = {}) => showToast(message, 'loading', 0, { persistent: true, ...options });
  const custom = (message, type, duration, options) => showToast(message, type, duration, options);

  return (
    <ToastContext.Provider value={{ 
      success, 
      error, 
      warning, 
      info, 
      loading,
      custom,
      removeToast, 
      clearAllToasts,
      pauseToasts,
      resumeToasts,
      isPaused,
      toastCount: toasts.length
    }}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        removeToast={removeToast} 
        clearAllToasts={clearAllToasts}
        isPaused={isPaused}
        pauseToasts={pauseToasts}
        resumeToasts={resumeToasts}
      />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast, clearAllToasts, isPaused, pauseToasts, resumeToasts }) => {
  return (
    <>
      <div className="fixed z-50 space-y-2 top-20 right-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} isPaused={isPaused} />
          ))}
        </AnimatePresence>
      </div>
      
      {toasts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed z-50 top-4 right-4"
        >
          <div className="flex items-center p-2 space-x-2 border border-gray-700 rounded-lg bg-cinema-dark/90 backdrop-blur-sm">
            <span className="text-xs font-medium text-white">
              {toasts.length} toast{toasts.length !== 1 ? 's' : ''}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={isPaused ? resumeToasts : pauseToasts}
              className="p-1 text-gray-400 transition-colors hover:text-white"
              title={isPaused ? 'Resume toasts' : 'Pause toasts'}
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearAllToasts}
              className="p-1 text-gray-400 transition-colors hover:text-red-400"
              title="Clear all toasts"
            >
              <X className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </>
  );
};

const Toast = ({ toast, onRemove, isPaused }) => {
  const { id, message, type, action, persistent } = toast;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (persistent || isPaused || toast.duration <= 0) return;

    const startTime = Date.now();
    const duration = toast.duration;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, ((duration - elapsed) / duration) * 100);
      setProgress(remaining);

      if (remaining > 0 && !isPaused) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }, [toast.duration, persistent, isPaused]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'loading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RotateCcw className="w-5 h-5 text-blue-400" />
          </motion.div>
        );
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'loading':
        return 'bg-blue-500/20 border-blue-500/30';
      default:
        return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'loading':
        return 'bg-blue-400';
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      className={`
        max-w-sm w-full bg-cinema-dark/90 backdrop-blur-sm border rounded-lg shadow-xl overflow-hidden
        ${getBackgroundColor()}
      `}
    >
      {!persistent && toast.duration > 0 && (
        <div className="h-1 bg-gray-700/50">
          <motion.div
            className={`h-full ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {message}
            </p>
            {action && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="px-3 py-1 mt-2 text-xs text-white transition-colors rounded bg-white/10 hover:bg-white/20"
              >
                {action.label}
              </motion.button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(id)}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-white"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(toast.createdAt).toLocaleTimeString()}</span>
          {persistent && <span className="text-yellow-400">Persistent</span>}
          {isPaused && <span className="text-blue-400">Paused</span>}
        </div>
      </div>
    </motion.div>
  );
};