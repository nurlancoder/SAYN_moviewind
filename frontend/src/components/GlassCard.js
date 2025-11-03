import { motion } from 'framer-motion';

const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl ${className}`}
    whileHover={{ scale: 1.02, y: -5 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
);

export default GlassCard;