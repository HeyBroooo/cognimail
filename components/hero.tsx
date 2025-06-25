"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { MorphingText } from "@/components/magicui/morphing-text";
import dynamic from "next/dynamic";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  const Spline = dynamic(() => import("@splinetool/react-spline"), {
    ssr: false,
  });

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
    <section ref={heroRef} className="relative px-6 py-20 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div className="announcement">
              <div className="inline-flex items-center rounded-full border border-gray-800 bg-gray-900/50 px-4 py-2 text-sm backdrop-blur-sm">
                <span className="text-gray-300 font-mono">
                  Learn More About Cognimail
                </span>
                <ArrowRight className="ml-2 h-3 w-3" />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="hero-title font-mono text-5xl md:text-7xl font-bold tracking-tight leading-tight text-balance">
                Email For
                <br />
                <MorphingText
                  className="inline-block mr-2"
                  texts={["Developers", "Businesses", "Agencies", "Startups"]}
                />
              </h1>

              <div className="hero-subtitle space-y-3">
                <p className="text-lg font-mono text-gray-400 max-w-lg">
                  Verify Your Bulk Emails, Build Template And Start Campaign
                </p>
                <p className="text-lg font-mono text-gray-400 max-w-lg">
                  Build Template, Verify Bulk Emails and Start Your Personal Campaign
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                className="group relative inline-block text-sm font-medium text-black focus:ring-3 focus:outline-hidden"
                href="#"
              >
                <span className="absolute inset-0 rounded-xl border border-white"></span>
                <span className="block border border-current rounded-xl text-xl font-mono  bg-white px-12 py-3 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                  Start Campaign
                </span>
              </a>
            </div>
          </div>


          <div className="flex justify-center lg:justify-end">
            <div className="w-full h-full lg:h-[500px]">
              <Spline
                scene="https://prod.spline.design/NIhQuEEATHEkqtTZ/scene.splinecode"
                className="w-full h-full"
                onLoad={() => console.log("Spline scene loaded")}
                about="Spline scene for Cognimail"
                onError={(error) => console.error("Spline error:", error)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
