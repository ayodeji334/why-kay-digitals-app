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

  // Reaching 0 only stops the interval above — isActive itself stayed
  // true forever, so anything gating a "Resend" button on isActive
  // (rather than countdown > 0) stayed disabled even once the cooldown
  // was long over. Flip it here once the countdown actually finishes.
  useEffect(() => {
    if (countdown === 0) {
      setIsActive(false);
    }
  }, [countdown]);

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
