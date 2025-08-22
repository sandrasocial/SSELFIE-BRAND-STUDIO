import { motion, AnimatePresence } from 'framer-motion';

interface AuthTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
}

export const AuthTransition = ({ children, isVisible }: AuthTransitionProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};