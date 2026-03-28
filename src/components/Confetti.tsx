"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  trigger: boolean;
}

export default function Confetti({ trigger }: ConfettiProps) {
  useEffect(() => {
    if (trigger) {
      // Confetti burst from center
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#F59E0B", "#F43F5E", "#7C3AED", "#4C1D95", "#25D366"],
        gravity: 1,
        decay: 0.97,
        scalar: 1.2,
      });

      // Secondary burst from sides
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 80,
          origin: { x: 0.2, y: 0.3 },
          colors: ["#F59E0B", "#7C3AED"],
          gravity: 0.8,
          scalar: 0.8,
        });

        confetti({
          particleCount: 40,
          spread: 80,
          origin: { x: 0.8, y: 0.3 },
          colors: ["#F43F5E", "#4C1D95"],
          gravity: 0.8,
          scalar: 0.8,
        });
      }, 100);
    }
  }, [trigger]);

  return null;
}
