"use client"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Check, Crown, Zap, Star } from "lucide-react"

export default function Billing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPlan] = useState("Free")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      features: [
        "1,000 emails per month",
        "Basic email templates",
        "Email list management",
        "Basic analytics",
        "Email support",
      ],
      popular: false,
      icon: Star,
    },
    {
      name: "Pro",
      price: { monthly: 29, yearly: 290 },
      description: "Best for growing businesses",
      features: [
        "10,000 emails per month",
        "Advanced email templates",
        "Email automation",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "A/B testing",
      ],
      popular: true,
      icon: Crown,
    },
    {
      name: "Enterprise",
      price: { monthly: 99, yearly: 990 },
      description: "For large organizations",
      features: [
        "Unlimited emails",
        "Custom email templates",
        "Advanced automation",
        "White-label solution",
        "Dedicated support",
        "API access",
        "Custom integrations",
        "Advanced reporting",
      ],
      popular: false,
      icon: Zap,
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".plan-card", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h1>
        <p className="text-gray-400">Upgrade your email marketing capabilities</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Current Plan: {currentPlan}</h3>
            <p className="text-gray-400">You&apos;re currently on the {currentPlan} plan</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              $0<span className="text-sm text-gray-400">/month</span>
            </p>
            <p className="text-gray-400">450 / 1,000 emails used</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-600/30 rounded-full h-2">
            <div className="w-[45%] bg-lime-400 rounded-full h-2"></div>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-700/50 rounded-xl p-1 border border-gray-600/50">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === "monthly" ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === "yearly" ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"
            }`}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-500 text-white px-1 rounded">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = plan.name === currentPlan

          return (
            <div
              key={plan.name}
              className={`plan-card relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-200 ${
                plan.popular
                  ? "border-lime-400 shadow-lg shadow-lime-400/20 scale-105"
                  : "border-gray-700/50 hover:border-gray-600/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-lime-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <Icon className={`w-8 h-8 mx-auto mb-4 ${plan.popular ? "text-lime-400" : "text-gray-400"}`} />
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">${plan.price[billingCycle]}</span>
                  <span className="text-gray-400 text-sm">/{billingCycle === "monthly" ? "month" : "year"}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrentPlan}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  isCurrentPlan
                    ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                    : plan.popular
                      ? "bg-lime-400 text-gray-900 hover:bg-lime-300"
                      : "bg-gray-700/50 text-white hover:bg-gray-600/50 border border-gray-600/50"
                }`}
              >
                {isCurrentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
