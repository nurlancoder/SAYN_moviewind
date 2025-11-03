import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ size = 8, color = 'text-cinema-blue' }) => (
  <div className="flex items-center justify-center py-16">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader className={`w-${size} h-${size} ${color}`} />
    </motion.div>
  </div>
);

export default LoadingSpinner;