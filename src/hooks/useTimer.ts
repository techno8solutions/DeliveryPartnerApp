import { useEffect, useState } from 'react';

export const useTimer = (start = true) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout; // ✅ Add type here
    if (start) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [start]);

  return {
    seconds,
    formatted: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
    reset: () => setSeconds(0),
  };
};
