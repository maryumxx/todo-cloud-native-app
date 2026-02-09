'use client';

import React, { useState, useEffect } from 'react';
import { onRetry } from '../../lib/api-client';

export function ReconnectingIndicator() {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [maxRetries, setMaxRetries] = useState(3);

  useEffect(() => {
    const unsubscribe = onRetry((currentAttempt, max) => {
      setIsReconnecting(true);
      setAttempt(currentAttempt);
      setMaxRetries(max);

      // Hide after a delay when not retrying anymore
      const timer = setTimeout(() => {
        setIsReconnecting(false);
      }, 3000);

      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  if (!isReconnecting) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3 bg-yellow-500 text-black rounded-lg shadow-lg animate-pulse">
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="font-medium">
        Reconnecting... ({attempt}/{maxRetries})
      </span>
    </div>
  );
}

export default ReconnectingIndicator;
