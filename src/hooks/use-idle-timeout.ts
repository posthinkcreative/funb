'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * A custom hook to detect user inactivity and trigger a callback.
 * @param timeout The inactivity duration in milliseconds.
 * @param onIdle The callback function to execute when the user is idle.
 */
const useIdleTimeout = (timeout: number, onIdle: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use useCallback to memoize the onIdle function reference
  const idleCallback = useCallback(onIdle, [onIdle]);

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(idleCallback, timeout);
    };

    const handleActivity = () => {
      resetTimer();
    };

    // Set up the initial timer
    resetTimer();

    // Add event listeners for user activity
    events.forEach(event => window.addEventListener(event, handleActivity));

    // Cleanup function to remove event listeners and clear the timer
    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [timeout, idleCallback]); // Effect dependencies
};

export default useIdleTimeout;
