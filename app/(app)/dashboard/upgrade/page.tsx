"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"
import { gsap } from "gsap"
import { ArrowLeft, Minus, Plus, Zap, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default function Upgrade() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [emailLimit, setEmailLimit] = useState(1000)
  const [currentUsage] = useState(450)
  const maxLimit = 50000
  const minLimit = 1000
  const pricePerThousand = 5

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".upgrade-section", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailLimit(Number.parseInt(e.target.value))
  }

  const incrementLimit = () => {
    if (emailLimit < maxLimit) {
      setEmailLimit(Math.min(emailLimit + 1000, maxLimit))
    }
  }

  const decrementLimit = () => {
    if (emailLimit > minLimit) {
      setEmailLimit(Math.max(emailLimit - 1000, minLimit))
    }
  }

  const calculatePrice = () => {
    const additionalEmails = Math.max(0, emailLimit - 1000)
    return (additionalEmails / 1000) * pricePerThousand
  }

  const usagePercentage = (currentUsage / emailLimit) * 100

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="upgrade-section bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/billing" className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Upgrade Email Limits
              </h2>
              <p className="text-gray-400">
                Your email limit expires on Dec 31st 2025. Prices are prorated to this date.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Usage */}
      <div className="upgrade-section bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-lime-400" />
          Current Usage
        </h3>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-400">Available Email Credits</span>
            <p className="text-2xl font-bold text-white">
              {currentUsage.toLocaleString()} / {emailLimit.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-400">Usage Percentage</span>
            <p className="text-2xl font-bold text-lime-400">{Math.round(usagePercentage)}%</p>
          </div>
        </div>
        <div className="w-full bg-gray-600/30 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-lime-400 to-green-500 rounded-full h-4 transition-all duration-300 shadow-lg shadow-lime-400/30"
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {emailLimit - currentUsage} credits remaining this month
        </p>
      </div>

      {/* Email Limit Selector */}
      <div className="upgrade-section bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Select Your Email Limit</h3>
          <p className="text-gray-400">Adjust the slider to set your desired email limit</p>
        </div>

        {/* Slider */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">{minLimit.toLocaleString()}</span>
            <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium border border-yellow-500/30">
              Total = {minLimit.toLocaleString()} + {(emailLimit - minLimit).toLocaleString()}
            </div>
            <span className="text-sm text-gray-400">{maxLimit.toLocaleString()}</span>
          </div>

          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={1000}
            value={emailLimit}
            onChange={handleSliderChange}
            className="w-full h-3 bg-gray-600/30 rounded-lg appearance-none cursor-pointer slider"
          />

          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>1K</span>
            <span>10K</span>
            <span>20K</span>
            <span>30K</span>
            <span>40K</span>
            <span>50K</span>
          </div>
        </div>

        {/* Manual Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={decrementLimit}
            disabled={emailLimit <= minLimit}
            className="p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-5 h-5 text-gray-300" />
          </button>
          <div className="bg-gray-700/50 rounded-xl px-8 py-4 border border-gray-600/50 min-w-40 text-center">
            <span className="text-2xl font-bold text-white">{emailLimit.toLocaleString()}</span>
            <p className="text-xs text-gray-400 mt-1">emails</p>
          </div>
          <button
            onClick={incrementLimit}
            disabled={emailLimit >= maxLimit}
            className="p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="upgrade-section relative">
        <div
          className="bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl p-8 text-gray-900 relative overflow-hidden"
          style={{
            clipPath: "polygon(0% 0%, 97% 0%, 100% 10%, 100% 100%, 10% 100%, 0% 90%)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Pricing Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-800">Base Email Credits:</span>
                  <span className="font-medium">{minLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-800">Additional Credits:</span>
                  <span className="font-medium">{(emailLimit - minLimit).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-800">Price per 1K additional:</span>
                  <span className="font-medium">${pricePerThousand}</span>
                </div>
                <div className="border-t border-gray-800/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 text-lg">Total Email Credits:</span>
                    <span className="text-xl font-bold">{emailLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-800 text-lg">Monthly Cost:</span>
                    <span className="text-3xl font-bold">${calculatePrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <button className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors mb-4 shadow-lg">
                Upgrade Email Limit
              </button>
              <div className="bg-gray-900/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-800 font-medium">✨ What you get:</p>
                <ul className="text-xs text-gray-800 mt-2 space-y-1">
                  <li>• Instant limit increase</li>
                  <li>• No setup fees</li>
                  <li>• Cancel anytime</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              <p className="text-center text-xs text-gray-800">
                *By proceeding you agree to the{" "}
                <Link href="/terms" className="underline hover:no-underline font-medium">
                  Terms & Conditions
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 w-16 h-16 bg-gray-900/10 rounded-full"></div>
          <div className="absolute top-4 right-4 w-8 h-8 bg-gray-900/10 rounded-full"></div>
          <div className="absolute top-1/2 right-8 w-4 h-4 bg-gray-900/10 rounded-full"></div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #84cc16, #22c55e);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(132, 204, 22, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #84cc16, #22c55e);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(132, 204, 22, 0.3);
        }
      `}</style>
    </div>
  )
}
