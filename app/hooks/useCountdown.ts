import { useEffect, useState } from "react";

export const useCountdown = (seconds: number) => {
  const [countdown, setCountdown] = useState(seconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, countdown]);

  const reset = () => {
    setCountdown(seconds);
    setIsActive(true);
  };

  const stop = () => {
    setCountdown(seconds);
    setIsActive(false);
  };

  return { countdown, isActive, reset, stop };
};
