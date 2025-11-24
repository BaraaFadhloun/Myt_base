import { useState, useEffect, useRef } from 'react';

interface DropdownInfoProps {
  title: string;
  subtitle?: string;
  isVisible: boolean;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  onClose?: () => void;
  triggerMethod: 'click' | 'hover';
}

export default function DropdownInfo({
  title,
  subtitle,
  isVisible,
  position = 'bottom',
  className = '',
  onClose,
  triggerMethod = 'click'
}: DropdownInfoProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match this with the transition duration in the className
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible]);

  useEffect(() => {
    if (triggerMethod === 'click') {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && isVisible) {
          onClose && onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isVisible, onClose, triggerMethod]);

  if (!isAnimating && !isVisible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-[-6px] left-1/2 -translate-x-1/2 rotate-45';
      case 'right':
        return 'left-[-6px] top-1/2 -translate-y-1/2 rotate-45';
      case 'bottom':
        return 'top-[-6px] left-1/2 -translate-x-1/2 rotate-45';
      case 'left':
        return 'right-[-6px] top-1/2 -translate-y-1/2 rotate-45';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute ${getPositionClasses()} bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-md text-sm w-auto min-w-[150px] transition-all duration-600 ease-in-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 shadow-[0_0_15px_rgba(124,58,237,0.2),0_0_15px_rgba(59,130,246,0.2)] dark:shadow-[0_0_15px_rgba(124,58,237,0.1),0_0_15px_rgba(59,130,246,0.1)]'
          : 'opacity-0 scale-95 pointer-events-none'
      } ${className}`}
      role="tooltip"
      aria-hidden={!isVisible}
    >
      <div className="font-semibold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
        {title}
      </div>
      {subtitle && <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">{subtitle}</div>}
      <div
        className={`absolute w-3 h-3 bg-white dark:bg-gray-800 transform ${getArrowClasses()} transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
      ></div>
    </div>
  );
}
