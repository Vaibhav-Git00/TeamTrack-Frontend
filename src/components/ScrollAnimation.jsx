import React, { useEffect, useRef, useState } from 'react';

const ScrollAnimation = ({ 
  children, 
  animation = 'fade-in', 
  delay = 0, 
  threshold = 0.1,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { threshold }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [delay, threshold]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (animation) {
      case 'fade-in':
        return 'animate-fade-in';
      case 'slide-in-up':
        return 'animate-slide-in-up';
      case 'slide-in-down':
        return 'animate-slide-in-down';
      case 'slide-in-left':
        return 'animate-slide-in-left';
      case 'slide-in-right':
        return 'animate-slide-in-right';
      case 'bounce-in':
        return 'animate-bounce-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-500 ${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;
