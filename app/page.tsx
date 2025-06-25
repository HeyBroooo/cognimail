
"use client";
import Header from "@/components/header";
import Hero from "@/components/hero";
import { useEffect, useRef } from "react";
import { gsap } from "gsap"



export default function Home() {

   const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fade-in", {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
      })
    }, mainRef)

    return () => ctx.revert()
  }, [])



  return (
   
    <main ref={mainRef} className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <Header />
        <Hero />
      </div>
    </main>
  );
}
