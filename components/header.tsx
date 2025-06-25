"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SparklesText } from "@/components/magicui/sparkles-text";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".nav-item", {
        opacity: 0,
        y: -20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.2,
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header ref={headerRef} className="relative z-50 px-6 py-4">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="nav-item">
          <SparklesText className="text-xl">CogniMail</SparklesText>
        </div>

        <div className="flex items-center space-x-4">
          <a
            className="group relative inline-block text-sm font-medium text-black focus:ring-3 focus:outline-hidden"
            href="#"
          >
            <span className="absolute inset-0 border border-gray-200 rounded-2xl"></span>
            <span className="block border text-sm font-medium font-mono rounded-2xl border-gray-900 bg-white px-12 py-3 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
              Get Started
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
