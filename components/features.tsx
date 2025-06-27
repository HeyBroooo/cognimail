"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Zap,
  Shield,
  BarChart3,
  Code,
  Palette,
  Webhook,
  Sparkles,
  ArrowRight,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PowerfulFeatures() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Delivery",
      description:
        "Send emails in milliseconds with our optimized infrastructure and global CDN network for maximum performance.",
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      glowColor: "rgba(251, 191, 36, 0.4)",
      bgPattern:
        "radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
      stats: "< 50ms",
      category: "Performance",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "99.9% Deliverability",
      description:
        "Advanced reputation management and authentication protocols ensure your emails reach the inbox every time.",
      gradient: "from-green-400 via-emerald-500 to-teal-500",
      glowColor: "rgba(34, 197, 94, 0.4)",
      bgPattern:
        "radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)",
      stats: "99.9%",
      category: "Reliability",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Analytics",
      description:
        "Track opens, clicks, bounces, and engagement with detailed analytics and actionable insights dashboard.",
      gradient: "from-purple-400 via-pink-500 to-rose-500",
      glowColor: "rgba(168, 85, 247, 0.4)",
      bgPattern:
        "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
      stats: "Real-time",
      category: "Analytics",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Developer First",
      description:
        "Simple REST API, SDKs for all languages, comprehensive documentation, and developer-friendly tools.",
      gradient: "from-blue-400 via-cyan-500 to-indigo-500",
      glowColor: "rgba(59, 130, 246, 0.4)",
      bgPattern:
        "radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
      stats: "10+ SDKs",
      category: "Developer",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Template Builder",
      description:
        "Drag-and-drop email builder with responsive templates, custom HTML support, and design system integration.",
      gradient: "from-red-400 via-rose-500 to-pink-500",
      glowColor: "rgba(239, 68, 68, 0.4)",
      bgPattern:
        "radial-gradient(circle at 70% 30%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)",
      stats: "100+ Templates",
      category: "Design",
    },
    {
      icon: <Webhook className="w-8 h-8" />,
      title: "Webhooks & Events",
      description:
        "Real-time event notifications for delivery, opens, clicks, bounces with custom webhook endpoints.",
      gradient: "from-indigo-400 via-purple-500 to-violet-500",
      glowColor: "rgba(99, 102, 241, 0.4)",
      bgPattern:
        "radial-gradient(circle at 40% 60%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
      stats: "Instant",
      category: "Integration",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial animation for the section
      gsap.fromTo(
        ".features-title",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        ".features-subtitle",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );

      // Cards entrance animation
      gsap.fromTo(
        ".feature-card",
        {
          opacity: 0,
          y: 60,
          scale: 0.8,
          rotateX: 15,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 85%",
          },
        }
      );

      cardsRef.current.forEach((card) => {
        if (!card) return;

        const icon = card.querySelector(".feature-icon");
        const title = card.querySelector(".feature-title");
        const description = card.querySelector(".feature-description");
        const stats = card.querySelector(".feature-stats");
        const category = card.querySelector(".feature-category");
        const glowElement = card.querySelector(".glow-effect");
        const backgroundPattern = card.querySelector(".bg-pattern");

        // Hover enter animation
        const hoverEnter = () => {
          gsap.to(card, {
            scale: 1.03,
            y: -8,
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(icon, {
            scale: 1.1,
            rotation: 5,
            duration: 0.3,
            ease: "back.out(1.7)",
          });

          gsap.to(title, {
            color: "#ffffff",
            duration: 0.3,
          });

          gsap.to([description, stats], {
            color: "#e5e7eb",
            duration: 0.3,
          });

          gsap.to(category, {
            scale: 1.05,
            duration: 0.3,
          });

          gsap.to(glowElement, {
            opacity: 0.8,
            scale: 1.1,
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(backgroundPattern, {
            opacity: 0.8,
            scale: 1.05,
            duration: 0.5,
            ease: "power2.out",
          });
        };

        // Hover leave animation
        const hoverLeave = () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
          });

          gsap.to(title, {
            color: "#f3f4f6",
            duration: 0.3,
          });

          gsap.to([description, stats], {
            color: "#9ca3af",
            duration: 0.3,
          });

          gsap.to(category, {
            scale: 1,
            duration: 0.3,
          });

          gsap.to(glowElement, {
            opacity: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(backgroundPattern, {
            opacity: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          });
        };

        card.addEventListener("mouseenter", hoverEnter);
        card.addEventListener("mouseleave", hoverLeave);
      });

      // Sparkle animation
      gsap.to(".sparkle", {
        rotation: 360,
        duration: 4,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".sparkle", {
        scale: 1.2,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="sparkle w-5 h-5 text-blue-400 mr-3" />
            <span className="text-blue-400 font-mono font-semibold tracking-wide uppercase text-sm">
              Features
            </span>
            <Sparkles className="sparkle w-5 h-5 text-purple-400 ml-3" />
          </div>

          <h2 className="features-title font-mono text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Powerful Features
          </h2>

          <p className="features-subtitle text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-mono">
            Everything you need to send, track, and optimize your email campaigns at scale with
            <span className="text-blue-400 font-semibold"> enterprise-grade reliability</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="feature-card relative group cursor-pointer"
            >
              {/* Glow Effect */}
              <div
                className="glow-effect absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-all duration-100"
                style={{
                  background: `linear-gradient(135deg, ${feature.glowColor}, transparent)`,
                }}
              ></div>

              {/* Background Pattern */}
              <div
                className="bg-pattern absolute inset-0 rounded-2xl opacity-0 transition-all duration-500"
                style={{ background: feature.bgPattern }}
              ></div>

              {/* Card Content */}
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 md:p-8 h-full transition-all duration-500 group-hover:border-gray-700/50">
                {/* Category Badge */}
                <div className="feature-category inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-mono bg-gray-800/50 text-gray-300 mb-4 md:mb-6 border border-gray-700/50">
                  {feature.category}
                </div>

                {/* Icon */}
                <div className="feature-icon mb-4 md:mb-6 relative">
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 md:p-4 shadow-lg`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>

                  {/* Icon glow */}
                  <div
                    className={`absolute inset-0 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500`}
                  ></div>
                </div>

                {/* Content */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="feature-title text-xl md:text-2xl font-bold font-mono text-gray-100 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="feature-description text-gray-400 leading-relaxed text-sm md:text-base font-mono">
                    {feature.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-800/50">
                    <div className="feature-stats text-sm text-gray-500 font-mono">
                      <span className="font-semibold text-gray-300">
                        {feature.stats}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}