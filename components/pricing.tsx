"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check, ArrowRight, Sparkles } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const pricingTiers = [
  {
    name: "Free Tier",
    price: "$0",
    period: "/month",
    features: [
      "Send up to 50 E-Mails/Newsletters",
      "Classic email Template editor",
      "Basic Analytics (open rates, bounce rates)",
    ],
    buttonText: "Get Started",
    popular: false,
    gradient: "from-gray-400 via-gray-500 to-gray-600",
    glowColor: "rgba(156, 163, 175, 0.4)",
  },
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    features: [
      "Send up to 1,000 E-Mail/Newsletters",
      "Classic email editor",
      "Advanced Analytics (bounce rates, open rates, click through rates, spam checker)",
      "Email support",
    ],
    buttonText: "Get Started",
    popular: true,
    gradient: "from-blue-400 via-cyan-500 to-indigo-500",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    features: [
      "All features in the Starter package",
      "Send up to 10,000 E-Mail/Newsletters",
      "Classic email editor",
      "Professional Analytics (bounce rates, open rates, click through rates, spam checker, separate link click rates)",
      "E-Mail list Management",
    ],
    buttonText: "Get Started",
    popular: false,
    gradient: "from-purple-400 via-pink-500 to-rose-500",
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "/month",
    features: [
      "All features in the Professional package",
      "Send up to 100,000 E-Mail/Newsletters",
      "Custom Branding (remove Safeburst Logo)",
      "Priority E-Mail support",
    ],
    buttonText: "Get Started",
    popular: false,
    gradient: "from-indigo-400 via-purple-500 to-violet-500",
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
]

// Custom Animated Button Component
type AnimatedButtonProps = {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  popular?: boolean
}

const AnimatedButton = ({ children, onClick, className = "", popular = false }: AnimatedButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const handleMouseEnter = () => {
      setIsHovered(true)
      gsap.to(button, {
        scale: 1.02,
        y: -2,
        duration: 0.4,
        ease: "power2.out",
      })
      gsap.to(button.querySelector(".button-bg"), {
        scaleX: 1,
        duration: 0.4,
        ease: "power2.out",
      })
      gsap.to(button.querySelector(".button-text"), {
        x: -4,
        duration: 0.4,
        ease: "power2.out",
      })
      gsap.to(button.querySelector(".button-arrow"), {
        x: 4,
        duration: 0.4,
        ease: "power2.out",
      })
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      gsap.to(button, {
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      })
      gsap.to(button.querySelector(".button-bg"), {
        scaleX: 0,
        duration: 0.4,
        ease: "power2.out",
      })
      gsap.to(button.querySelector(".button-text"), {
        x: 0,
        duration: 0.4,
        ease: "power2.out",
      })
      gsap.to(button.querySelector(".button-arrow"), {
        x: 0,
        duration: 0.4,
        ease: "power2.out",
      })
    }

    const handleClick = () => {
      gsap.to(button, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })
    }

    button.addEventListener("mouseenter", handleMouseEnter)
    button.addEventListener("mouseleave", handleMouseLeave)
    button.addEventListener("click", handleClick)

    return () => {
      button.removeEventListener("mouseenter", handleMouseEnter)
      button.removeEventListener("mouseleave", handleMouseLeave)
      button.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`relative w-full h-12 rounded-lg border ${popular ? "border-blue-400" : "border-gray-700"} bg-gray-900 overflow-hidden transition-all duration-300 ${className}`}
    >
      <div className={`button-bg absolute inset-0 ${popular ? "bg-blue-500" : "bg-gray-700"} origin-left transform scale-x-0`} />
      <div className="relative z-10 flex items-center justify-center h-full">
        <span
          className={`button-text font-mono font-medium transition-colors duration-300 ${isHovered ? "text-white" : popular ? "text-blue-400" : "text-gray-300"}`}
        >
          {children}
        </span>
        <ArrowRight
          className={`button-arrow w-4 h-4 ml-2 transition-colors duration-300 ${isHovered ? "text-white" : popular ? "text-blue-400" : "text-gray-300"}`}
        />
      </div>
    </button>
  )
}

// Custom Pricing Card Component
type PricingCardProps = {
  tier: typeof pricingTiers[number]
  index: number
  onHover: (index: number) => void
  onLeave: () => void
}

const PricingCard = ({ tier, index, onHover, onLeave }: PricingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseEnter = () => {
      onHover(index)
      gsap.to(card, {
        y: -8,
        scale: 1.02,
        duration: 0.6,
        ease: "power2.out",
      })
      gsap.to(card.querySelector(".card-glow"), {
        opacity: tier.popular ? 0.6 : 0.3,
        scale: 1.1,
        duration: 0.6,
        ease: "power2.out",
      })
      gsap.to(card.querySelectorAll(".feature-item"), {
        x: 4,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      })
    }

    const handleMouseLeave = () => {
      onLeave()
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      })
      gsap.to(card.querySelector(".card-glow"), {
        opacity: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      })
      gsap.to(card.querySelectorAll(".feature-item"), {
        x: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      })
    }

    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [index, onHover, onLeave, tier.popular])

  return (
    <div
      ref={cardRef}
      className={`relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 border ${tier.popular ? "border-blue-400" : "border-gray-700/50"} hover:border-gray-600`}
    >
      {/* Glow Effect */}
      <div 
        className="card-glow absolute inset-0 rounded-2xl opacity-0 blur-xl transition-all duration-500"
        style={{ background: `linear-gradient(135deg, ${tier.glowColor}, transparent)` }}
      />

      {/* Background Pattern */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-10"
        style={{ background: `radial-gradient(circle at 30% 70%, ${tier.glowColor} 0%, transparent 50%)` }}
      />

      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className={`bg-gradient-to-r ${tier.gradient} text-white px-4 py-1 text-xs font-mono font-semibold rounded-full`}>
            Most Popular
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h3 className="text-xl font-mono font-semibold text-gray-100 mb-2">{tier.name}</h3>
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-5xl font-bold font-mono bg-gradient-to-r bg-clip-text text-transparent ${tier.gradient}">
              {tier.price}
            </span>
            <span className="text-gray-400 font-mono ml-2">{tier.period}</span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {tier.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="feature-item flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center mt-0.5 flex-shrink-0`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-mono text-gray-300 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        <AnimatedButton popular={tier.popular}>{tier.buttonText}</AnimatedButton>
      </div>
    </div>
  )
}

export default function PricingComponent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const connectingLinesRef = useRef<SVGSVGElement>(null)
  const [activeCard, setActiveCard] = useState<number | null>(null)
  console.log("Active Card:", activeCard)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        ".pricing-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".pricing-header",
            start: "top 80%",
          },
        },
      )

      // Cards stagger animation
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".pricing-grid",
            start: "top 70%",
          },
        },
      )

      // Prepare stroke-dash animation for each connecting line
      const lines = gsap.utils.toArray<SVGPathElement>(".connecting-line")
      lines.forEach((line) => {
        const len = line.getTotalLength()
        line.style.strokeDasharray = `${len}`
        line.style.strokeDashoffset = `${len}`
      })

      // Animate the lines drawing in
      gsap.to(lines, {
        strokeDashoffset: 0,
        opacity: 0.3,
        duration: 2,
        stagger: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".pricing-grid",
          start: "top 60%",
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleCardHover = (index: number) => {
    setActiveCard(index)
    gsap.to(`.line-${index}`, {
      opacity: 0.8,
      strokeWidth: 2,
      duration: 0.1,
      ease: "power2.out",
    })
  }

  const handleCardLeave = () => {
    setActiveCard(null)
    // Reset connecting lines
    gsap.to(".connecting-line", {
      opacity: 0.3,
      strokeWidth: 1,
      duration: 0.4,
      ease: "power2.out",
    })
  }

  return (
    <div ref={containerRef} className="min-h-screen  py-20 px-4 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="pricing-header text-center mb-20">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="sparkle w-5 h-5 text-blue-400 mr-3" />
            <span className="text-blue-400 font-mono font-semibold tracking-wide uppercase text-sm">
              Pricing
            </span>
            <Sparkles className="sparkle w-5 h-5 text-purple-400 ml-3" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-mono mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto font-mono">
            Choose the perfect plan for your business needs
          </p>
        </div>

        {/* Pricing Grid with Connecting Lines */}
        <div className="relative">
          {/* SVG for connecting lines */}
          <svg
            ref={connectingLinesRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0" />
                <stop offset="50%" stopColor="#9CA3AF" stopOpacity="1" />
                <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Horizontal connecting lines */}
            <path
              className="connecting-line line-0"
              d="M 25% 50% Q 37.5% 45% 50% 50%"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
            <path
              className="connecting-line line-1"
              d="M 50% 50% Q 62.5% 45% 75% 50%"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
            <path
              className="connecting-line line-2"
              d="M 75% 50% Q 87.5% 55% 100% 50%"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          </svg>

          <div className="pricing-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.name}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el
                }}
              >
                <PricingCard
                  tier={tier}
                  index={index}
                  onHover={handleCardHover}
                  onLeave={handleCardLeave}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-12 max-w-2xl mx-auto relative overflow-hidden border border-gray-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 via-transparent to-gray-800/50 opacity-50" />
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold font-mono text-gray-100 mb-4">Need something custom?</h3>
              <p className="text-gray-300 font-mono mb-8">
                Let&apos;s discuss a plan that&apos;s tailored specifically for your business needs.
              </p>
              <AnimatedButton className="max-w-xs mx-auto">Contact Sales</AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}