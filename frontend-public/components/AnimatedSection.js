import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

// Animation variants for different entrance effects
export const fadeUpVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const scaleInVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotateX: -15
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

export const slideInVariants = {
  hidden: { 
    opacity: 0, 
    x: -60
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Hover effect variants
export const hoverLiftVariants = {
  rest: { 
    y: 0, 
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  },
  hover: { 
    y: -8, 
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const hoverScaleVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const hoverGlowVariants = {
  rest: { 
    boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)"
  },
  hover: { 
    boxShadow: "0 0 20px 5px rgba(59, 130, 246, 0.3)",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Main AnimatedSection component
const AnimatedSection = ({ 
  children, 
  variant = 'fadeUp', 
  className = '', 
  delay = 0,
  threshold = 0.2,
  once = true,
  ...props 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    threshold, 
    once,
    margin: "-100px 0px -100px 0px"
  });

  // Select animation variant
  const getVariants = () => {
    switch (variant) {
      case 'scaleIn':
        return scaleInVariants;
      case 'slideIn':
        return slideInVariants;
      case 'stagger':
        return staggerContainerVariants;
      default:
        return fadeUpVariants;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getVariants()}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Specialized components for common use cases
export const AnimatedCard = ({ children, className = '', ...props }) => (
  <motion.div
    initial="rest"
    whileHover="hover"
    variants={hoverLiftVariants}
    className={`cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedButton = ({ children, className = '', variant = 'scale', ...props }) => {
  const buttonVariants = variant === 'glow' ? hoverGlowVariants : hoverScaleVariants;
  
  return (
    <motion.button
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      variants={buttonVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const StaggeredList = ({ children, className = '', itemClassName = '', ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerContainerVariants}
    className={className}
    {...props}
  >
    {Array.isArray(children) ? 
      children.map((child, index) => (
        <motion.div
          key={index}
          variants={staggerItemVariants}
          className={itemClassName}
        >
          {child}
        </motion.div>
      )) : 
      <motion.div variants={staggerItemVariants} className={itemClassName}>
        {children}
      </motion.div>
    }
  </motion.div>
);

// Floating animation for background elements
export const FloatingElement = ({ 
  children, 
  duration = 6, 
  delay = 0, 
  amplitude = 20,
  className = '',
  ...props 
}) => (
  <motion.div
    animate={{
      y: [-amplitude, amplitude, -amplitude],
      rotate: [-2, 2, -2],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Gradient text animation
export const AnimatedGradientText = ({ 
  children, 
  className = '',
  gradientClass = 'bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-red-500 dark:to-pink-500',
  ...props 
}) => (
  <motion.span
    initial={{ backgroundPosition: '0% 50%' }}
    animate={{ backgroundPosition: '100% 50%' }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }}
    className={`${gradientClass} bg-clip-text text-transparent bg-300% ${className}`}
    style={{
      backgroundSize: '300% 300%'
    }}
    {...props}
  >
    {children}
  </motion.span>
);

// Page transition wrapper
export const PageTransition = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default AnimatedSection;