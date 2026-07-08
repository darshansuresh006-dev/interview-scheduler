import { useState, useEffect } from 'react';

export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );

  useEffect(function() {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return function() {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isDesktop;
}