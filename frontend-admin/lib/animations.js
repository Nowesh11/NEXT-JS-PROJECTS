/**
 * Animation Utilities and Framer Motion Variants
 * Comprehensive animation library for the admin frontend
 */

// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98
  }
};

export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

// Stagger animation for lists
export const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: {
    y: 20,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

// Card hover animations
export const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    transition: {
      duration: 0.3,
      type: 'tween',
      ease: 'easeOut'
    }
  },
  hover: {
    scale: 1.05,
    y: -10,
    rotateX: 5,
    rotateY: 5,
    transition: {
      duration: 0.3,
      type: 'tween',
      ease: 'easeOut'
    }
  }
};

// Button animations
export const buttonVariants = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  tap: {
    scale: 0.98,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  }
};

// Modal animations
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

export const backdropVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1
  },
  exit: {
    opacity: 0
  }
};

// Drawer/Sidebar animations
export const drawerVariants = {
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40
    }
  },
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40
    }
  }
};

// Toast notifications
export const toastVariants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.3
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.3,
    transition: {
      duration: 0.2
    }
  }
};

// Loading spinner variants
export const spinnerVariants = {
  start: {
    rotate: 0
  },
  end: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Pulse animation
export const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Floating animation
export const floatVariants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Accordion animations
export const accordionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  }
};

// Tab animations
export const tabVariants = {
  inactive: {
    opacity: 0.6,
    scale: 0.95
  },
  active: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
};

// Progress bar animations
export const progressVariants = {
  initial: {
    width: 0
  },
  animate: (progress) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};

// Skeleton loading animations
export const skeletonVariants = {
  pulse: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Tooltip animations
export const tooltipVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  }
};

// Form field animations
export const fieldVariants = {
  rest: {
    scale: 1,
    borderColor: 'rgba(156, 163, 175, 1)'
  },
  focus: {
    scale: 1.02,
    borderColor: 'rgba(59, 130, 246, 1)',
    transition: {
      duration: 0.2
    }
  },
  error: {
    scale: 1.02,
    borderColor: 'rgba(239, 68, 68, 1)',
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.4
    }
  }
};

// Navigation menu animations
export const menuVariants = {
  closed: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

export const menuItemVariants = {
  closed: {
    opacity: 0,
    x: -20
  },
  open: {
    opacity: 1,
    x: 0
  }
};

// Cultural theme animations
export const culturalVariants = {
  tamil: {
    scale: [1, 1.02, 1],
    rotate: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  english: {
    y: [0, -2, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Glassmorphism reveal animation
export const glassRevealVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    scale: 0.9
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(20px)',
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

// Magnetic hover effect
export const magneticVariants = {
  rest: {
    x: 0,
    y: 0,
    rotate: 0
  },
  hover: (offset) => ({
    x: offset.x * 0.1,
    y: offset.y * 0.1,
    rotate: offset.x * 0.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30
    }
  })
};

// Particle system animation
export const particleVariants = {
  animate: {
    y: [0, -100],
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeOut',
      delay: Math.random() * 2
    }
  }
};

// Morphing shape animations
export const morphVariants = {
  circle: {
    borderRadius: '50%',
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  },
  square: {
    borderRadius: '10%',
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  },
  rounded: {
    borderRadius: '25%',
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
};

// Utility functions for animations
export const createStaggeredAnimation = (children, delay = 0.1) => ({
  visible: {
    transition: {
      delayChildren: delay,
      staggerChildren: delay
    }
  }
});

export const createSpringTransition = (stiffness = 300, damping = 30) => ({
  type: 'spring',
  stiffness,
  damping
});

export const createEaseTransition = (duration = 0.3, ease = 'easeOut') => ({
  duration,
  ease
});

// Animation presets
export const animationPresets = {
  gentle: {
    duration: 0.6,
    ease: 'easeOut'
  },
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 25
  },
  bouncy: {
    type: 'spring',
    stiffness: 700,
    damping: 10
  },
  smooth: {
    duration: 0.8,
    ease: [0.25, 0.46, 0.45, 0.94]
  }
};

// Responsive animation utilities
export const getResponsiveAnimation = (isMobile) => {
  if (isMobile) {
    return {
      ...animationPresets.gentle,
      duration: 0.3
    };
  }
  return animationPresets.snappy;
};

// Accessibility-aware animations
export const getAccessibleAnimation = (prefersReducedMotion) => {
  if (prefersReducedMotion) {
    return {
      duration: 0.01,
      ease: 'linear'
    };
  }
  return animationPresets.gentle;
};

// Custom hooks for animations
export const useAnimationControls = () => {
  const controls = {
    start: (animation) => {
      // Animation control logic
    },
    stop: () => {
      // Stop animation logic
    },
    set: (values) => {
      // Set animation values
    }
  };
  
  return controls;
};

// Animation sequence builder
export const createAnimationSequence = (steps) => {
  return steps.reduce((sequence, step, index) => {
    sequence[`step${index}`] = {
      ...step,
      transition: {
        ...step.transition,
        delay: index * 0.1
      }
    };
    return sequence;
  }, {});
};

export default {
  pageVariants,
  pageTransition,
  containerVariants,
  itemVariants,
  cardHoverVariants,
  buttonVariants,
  modalVariants,
  backdropVariants,
  drawerVariants,
  toastVariants,
  spinnerVariants,
  pulseVariants,
  floatVariants,
  accordionVariants,
  tabVariants,
  progressVariants,
  skeletonVariants,
  tooltipVariants,
  fieldVariants,
  menuVariants,
  menuItemVariants,
  culturalVariants,
  glassRevealVariants,
  magneticVariants,
  particleVariants,
  morphVariants,
  animationPresets,
  getResponsiveAnimation,
  getAccessibleAnimation
};