import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// Floating Action Button with micro-interactions
export const FloatingActionButton = ({ children, onClick, className = '', ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      className={`floating-action-btn ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      animate={{
        rotate: isHovered ? 360 : 0,
        transition: { duration: 0.6, ease: 'easeInOut' }
      }}
      {...props}
    >
      <motion.div
        animate={{
          scale: isPressed ? 0.8 : 1,
          transition: { duration: 0.1 }
        }}
      >
        {children}
      </motion.div>
    </motion.button>
  );
};

// Interactive Card with hover effects
export const InteractiveCard = ({ children, className = '', delay = 0, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={`interactive-card ${className}`}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: { 
          duration: 0.6, 
          delay: delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      } : {}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      {...props}
    >
      <motion.div
        animate={{
          rotateY: isHovered ? 5 : 0,
          transition: { duration: 0.3 }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Magnetic Button Effect
export const MagneticButton = ({ children, className = '', strength = 0.3, as = 'button', ...props }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const MotionComponent = motion[as];

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <MotionComponent
      ref={ref}
      className={`magnetic-btn ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

// Scroll-triggered reveal animation
export const ScrollReveal = ({ children, direction = 'up', delay = 0, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const variants = {
    up: { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -60 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={variants[direction].initial}
      animate={isInView ? variants[direction].animate : variants[direction].initial}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
};

// Parallax scroll effect
export const ParallaxElement = ({ children, speed = 0.5, className = '' }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className={className}
      style={{ y: smoothY }}
    >
      {children}
    </motion.div>
  );
};

// Stagger animation for lists
export const StaggerContainer = ({ children, staggerDelay = 0.1, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Morphing icon component
export const MorphingIcon = ({ icon1, icon2, isToggled, onClick, className = '', as = 'div' }) => {
  const MotionComponent = motion[as];
  
  return (
    <MotionComponent
      className={`morphing-icon ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        animate={{ rotateY: isToggled ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ 
            scale: isToggled ? [1, 0.8, 1] : [1, 1.2, 1],
            rotate: isToggled ? 180 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {isToggled ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon2} />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon1} />
          )}
        </motion.svg>
      </motion.div>
    </MotionComponent>
  );
};

// Ripple effect component
export const RippleButton = ({ children, className = '', onClick, ...props }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      className={`ripple-btn ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </motion.button>
  );
};

// Smooth scroll progress indicator
export const ScrollProgress = ({ className = '' }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={`scroll-progress ${className}`}
      style={{ scaleX }}
    />
  );
};

// Typing animation effect
export const TypewriterText = ({ text, speed = 50, className = '', delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, delay]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      >
        |
      </motion.span>
    </span>
  );
};

// Animated Counter Component
export const AnimatedCounter = ({ end, duration = 2000, className = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const startCount = 0;

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const currentCount = Math.floor(startCount + (end - startCount) * easeOutCubic(progress));
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}
    </span>
  );
};

export default {
  FloatingActionButton,
  InteractiveCard,
  MagneticButton,
  ScrollReveal,
  ParallaxElement,
  StaggerContainer,
  StaggerItem,
  MorphingIcon,
  RippleButton,
  ScrollProgress,
  TypewriterText,
  AnimatedCounter
};