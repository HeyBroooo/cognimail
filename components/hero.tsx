"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { MorphingText } from "@/components/ui/morphing-text";
import Spline from "@splinetool/react-spline";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".announcement", {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: "back.out(1.7)",
        delay: 0.5,
      });
      gsap.from(".hero-title", {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.8,
      });
      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power2.out",
        delay: 1.2,
      });
      gsap.from(".hero-button", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        delay: 1.6,
      });
      gsap.to(".cube-container", {
        y: -10,
        duration: 3,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative px-6 py-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[70vh] lg:min-h-[80vh]">
          {/* Content Section */}
          <div className="flex flex-col justify-center space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className="announcement">
              <div className="inline-flex items-center rounded-full border border-gray-800 bg-gray-900/50 px-4 py-2 text-sm backdrop-blur-sm">
                <span className="text-gray-300 font-mono">
                  Learn More About Cognimail
                </span>
                <ArrowRight className="ml-2 h-3 w-3" />
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <h1 className="hero-title font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight text-balance">
                Email For
                <br />
                <MorphingText
                  className="inline-block mr-2"
                  texts={["Developers", "Businesses", "Agencies", "Startups"]}
                />
              </h1>

              <div className="hero-subtitle space-y-2 md:space-y-3">
                <p className="text-base md:text-lg font-mono text-gray-400 max-w-lg">
                  Verify Your Bulk Emails, Build Template And Start Campaign
                </p>
                <p className="text-base md:text-lg font-mono text-gray-400 max-w-lg">
                  Build Template, Verify Bulk Emails and Start Your Personal Campaign
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                className="hero-button group relative inline-block text-sm font-medium text-black focus:ring-3 focus:outline-hidden"
                href="login"
              >
                <span className="absolute inset-0 rounded-xl border border-white transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1"></span>
                <span className="block border border-current rounded-xl text-lg md:text-xl font-mono bg-white px-8 md:px-12 py-2.5 md:py-3 transition-transform duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  Start Campaign
                </span>
              </a>
            </div>
          </div>

          {/* 3D Cube Section */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="w-full max-w-md md:max-w-lg lg:max-w-none lg:w-full">
              <div className="aspect-square w-full max-h-[300px] sm:max-h-[350px] md:max-h-[400px] lg:max-h-[500px] lg:h-[500px] relative cube-container overflow-hidden rounded-lg">
                <Spline
                  scene="https://prod.spline.design/NIhQuEEATHEkqtTZ/scene.splinecode"
                  className="w-full h-full object-contain"
                  onLoad={() => console.log("Spline scene loaded")}
                  onError={(error) => console.error("Spline error:", error)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}