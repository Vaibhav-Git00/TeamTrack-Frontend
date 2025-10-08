import React from 'react';

const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  animation = 'scale',
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-gradient-to-r from-primary-600 to-primary-700 
          hover:from-primary-700 hover:to-primary-800 
          text-white shadow-lg shadow-primary-500/25
          hover:shadow-xl hover:shadow-primary-500/30
        `;
      case 'secondary':
        return `
          bg-white dark:bg-dark-700 
          border border-gray-300 dark:border-dark-600 
          text-gray-700 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-dark-600
          shadow-sm hover:shadow-md
        `;
      case 'success':
        return `
          bg-gradient-to-r from-green-600 to-green-700 
          hover:from-green-700 hover:to-green-800 
          text-white shadow-lg shadow-green-500/25
          hover:shadow-xl hover:shadow-green-500/30
        `;
      case 'danger':
        return `
          bg-gradient-to-r from-red-600 to-red-700 
          hover:from-red-700 hover:to-red-800 
          text-white shadow-lg shadow-red-500/25
          hover:shadow-xl hover:shadow-red-500/30
        `;
      case 'ghost':
        return `
          bg-transparent 
          text-gray-700 dark:text-gray-300
          hover:bg-gray-100 dark:hover:bg-dark-700
          border border-transparent hover:border-gray-300 dark:hover:border-dark-600
        `;
      default:
        return getVariantClasses('primary');
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-2.5 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      case 'xl':
        return 'px-8 py-4 text-xl';
      default:
        return getSizeClasses('md');
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'scale':
        return 'transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]';
      case 'bounce':
        return 'transform transition-all duration-300 hover:-translate-y-1 active:translate-y-0';
      case 'pulse':
        return 'transition-all duration-300 hover:animate-pulse';
      case 'glow':
        return 'transition-all duration-300 hover:brightness-110';
      case 'slide':
        return 'transform transition-all duration-300 hover:translate-x-1';
      default:
        return getAnimationClasses('scale');
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-xl
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-300
  `;

  const combinedClasses = `
    ${baseClasses}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${getAnimationClasses()}
    ${className}
  `;

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:scale-110" />
      )}
    </button>
  );
};

export default AnimatedButton;
