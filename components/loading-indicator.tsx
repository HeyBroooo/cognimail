"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function LoadingIndicator() {
  const circleRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Rotate outer circle
      gsap.to(circleRef.current, {
        rotation: 360,
        repeat: -1,
        duration: 2.5,
        ease: "linear",
        transformOrigin: "50% 50%",
      });

      // Morph inner shape
      gsap.to(morphRef.current, {
        keyframes: [
          { borderRadius: "50% 50% 40% 60% / 60% 40% 60% 40%" },
          { borderRadius: "60% 40% 50% 50% / 50% 50% 40% 60%" },
          { borderRadius: "40% 60% 50% 50% / 50% 50% 60% 40%" },
          { borderRadius: "50%" },
        ],
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      // Pulsate inner shape
      gsap.to(morphRef.current, {
        scale: 1.1,
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: "sine.inOut",
      });

      // Fade text
      gsap.to(textRef.current, {
        opacity: 0.5,
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: "sine.inOut",
      });
    }, circleRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black">
      <div
        ref={circleRef}
        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-1.5 flex items-center justify-center shadow-lg"
      >
        <div
          ref={morphRef}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full border-[3px] border-black"
        ></div>
      </div>
      <div
        ref={textRef}
        className="mt-4 text-white text-lg sm:text-xl font-mono font-bold"
      >
        Loading...
      </div>
    </div>
  );
}