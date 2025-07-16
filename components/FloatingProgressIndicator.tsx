"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"
import { Activity, Check, X, Maximize2, FileText } from "lucide-react"
import { gsap } from "gsap"
import { useBackgroundProcess } from "@/hooks/useBackgroundProcess"

interface FloatingProgressIndicatorProps {
  onMaximize: () => void
}

const FloatingProgressIndicator: React.FC<FloatingProgressIndicatorProps> = ({ onMaximize }) => {
  const { isProcessing, progress, result, error, listTitle } = useBackgroundProcess()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Show/hide indicator based on processing state
  useEffect(() => {
    if (isProcessing || result || error) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 7000) // Extended to 7 seconds for better visibility
      return () => clearTimeout(timer)
    }
  }, [isProcessing, result, error])

  // Animate indicator entrance
  useEffect(() => {
    if (isVisible && indicatorRef.current) {
      gsap.fromTo(
        indicatorRef.current,
        {
          y: 100,
          opacity: 0,
          scale: 0.8,
          rotation: -10,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
      )
    } else if (!isVisible && indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setIsExpanded(false),
      })
    }
  }, [isVisible])

  // Animate progress bar
  useEffect(() => {
    if (progressRef.current && isProcessing) {
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        duration: 0.5,
        ease: "power2.out",
      })
    }
  }, [progress, isProcessing])

  // Animate expansion
  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        gsap.to(contentRef.current, {
          height: "auto",
          duration: 0.3,
          ease: "power2.out",
        })
      } else {
        gsap.to(contentRef.current, {
          height: "60px",
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }
  }, [isExpanded])

  if (!isVisible) return null

  const getStatusIcon = () => {
    if (isProcessing) return <Activity className="w-5 h-5 text-gray-900 animate-pulse" />
    if (result) return <Check className="w-5 h-5 text-gray-900" />
    if (error) return <X className="w-5 h-5 text-gray-900" />
    return <FileText className="w-5 h-5 text-gray-900" />
  }

  const getStatusText = () => {
    if (isProcessing) return "Processing..."
    if (result) return "Complete"
    if (error) return "Failed"
    return "Ready"
  }

  const getSubText = () => {
    if (isProcessing) return `${progress}% • ${listTitle || "Email Validation"}`
    if (result) return `${result.length} emails processed`
    if (error) return "Click to retry"
    return listTitle || "Email Validation"
  }

  return (
    <div
      ref={indicatorRef}
      className="fixed bottom-6 right-6 z-[9999] max-w-sm" // Highest z-index to ensure visibility
      style={{ transform: "translateZ(0)" }} // Force hardware acceleration
    >
      {/* Main Indicator */}
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Glowing border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-lime-400/40 via-emerald-500/40 to-green-400/40 rounded-2xl blur-sm opacity-90"></div>

        <div
          ref={contentRef}
          className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden"
          style={{ height: "60px" }}
        >
          {/* Header */}
          <div
            className="flex items-center p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                isProcessing
                  ? "bg-gradient-to-br from-lime-400 to-emerald-500"
                  : result
                    ? "bg-gradient-to-br from-emerald-400 to-green-500"
                    : "bg-gradient-to-br from-red-400 to-pink-500"
              }`}
            >
              {getStatusIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-200 truncate">{getStatusText()}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMaximize()
                  }}
                  className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors ml-2"
                >
                  <Maximize2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-xs text-gray-400 truncate">{getSubText()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="px-4 pb-2">
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  ref={progressRef}
                  className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && result && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-900/30 rounded-xl border border-emerald-700/30">
                  <div className="text-emerald-400 font-medium">Valid</div>
                  <div className="text-lg font-bold text-emerald-300">{result.validEmails.length}</div>
                </div>
                <div className="p-3 bg-red-900/30 rounded-xl border border-red-700/30">
                  <div className="text-red-400 font-medium">Invalid</div>
                  <div className="text-lg font-bold text-red-300">{result.invalidEmails.length}</div>
                </div>
              </div>

              <button
                onClick={onMaximize}
                className="w-full bg-gradient-to-r from-lime-400 to-emerald-500 text-gray-900 rounded-xl py-2 px-4 text-sm font-medium hover:from-lime-500 hover:to-emerald-600 transition-all duration-300"
              >
                View Results
              </button>
            </div>
          )}

          {/* Processing Animation */}
          {isProcessing && (
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-lime-400 to-emerald-500 animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Floating Action Button Style Alternative */}
      {!isExpanded && (
        <div className="absolute -top-2 -right-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isProcessing ? "bg-lime-400 animate-pulse" : result ? "bg-emerald-400" : "bg-red-400"
            }`}
          >
            <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FloatingProgressIndicator