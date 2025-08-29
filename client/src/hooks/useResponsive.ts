import { useState, useEffect } from 'react';

/**
 * Responsive breakpoints for the Switch card game
 * Centralized layout detection to prevent duplication
 */
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

/**
 * Custom hook for responsive design
 * Replaces individual mobile detection logic throughout components
 */
export function useResponsive(): ResponsiveState {
  const [dimensions, setDimensions] = useState({
    width:
      typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.desktop,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });

  useEffect(() => {
    // Handle SSR case where window might not be available
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial dimensions
    handleResize();

    // Add event listener with throttling for performance
    let timeoutId: number;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize);
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const { width, height } = dimensions;

  return {
    isMobile: width <= BREAKPOINTS.mobile,
    isTablet: width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet,
    isDesktop: width > BREAKPOINTS.tablet,
    width,
    height,
  };
}

/**
 * Simple hook for just mobile detection (for components that only need this)
 * @deprecated Use useResponsive instead for more comprehensive responsive design
 */
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}
