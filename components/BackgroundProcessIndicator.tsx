"use client"
import { useEffect, useRef } from "react"
import type React from "react"

import { Activity, Check, X, Maximize2 } from "lucide-react"
import { gsap } from "gsap"
import { useBackgroundProcess } from "@/hooks/useBackgroundProcess"

interface BackgroundProcessIndicatorProps {
  onMaximize: () => void
}

const BackgroundProcessIndicator: React.FC<BackgroundProcessIndicatorProps> = ({ onMaximize }) => {
  const { isProcessing, progress, result, error } = useBackgroundProcess()
  const indicatorRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isProcessing && indicatorRef.current) {
      gsap.fromTo(
        indicatorRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
      )
    }
  }, [isProcessing])

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }, [progress])

  if (!isProcessing && !result && !error) return null

  return (
    <div
      ref={indicatorRef}
      className="fixed bottom-6 right-6 z-40 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 shadow-2xl max-w-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-lg flex items-center justify-center">
            {isProcessing ? (
              <Activity className="w-4 h-4 text-gray-900 animate-pulse" />
            ) : result ? (
              <Check className="w-4 h-4 text-gray-900" />
            ) : (
              <X className="w-4 h-4 text-gray-900" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-200">
              {isProcessing ? "Processing..." : result ? "Complete" : "Failed"}
            </h4>
            <p className="text-xs text-gray-400">
              {isProcessing ? `${progress}% done` : result ? `${result.length} emails processed` : "Process failed"}
            </p>
          </div>
        </div>
        <button onClick={onMaximize} className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
          <Maximize2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {isProcessing && (
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: "0%" }}
          />
        </div>
      )}

      {result && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-emerald-400">Valid: {result.validEmails.length}</div>
          <div className="text-red-400">Invalid: {result.invalidEmails.length}</div>
        </div>
      )}
    </div>
  )
}

export default BackgroundProcessIndicator
