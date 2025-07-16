"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"
import {
  X,
  Upload,
  Check,
  AlertTriangle,
  Download,
  Minimize2,
  Zap,
  Activity,
  FileText,
  Sparkles,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { gsap } from "gsap"
import Script from "next/script"
import { useBackgroundProcess } from "@/hooks/useBackgroundProcess"
import type { EmailStatus } from "@/lib/processEmailFile"

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  hasUsedFreeTier: boolean
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  hasUsedFreeTier,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [listTitle, setListTitle] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"valid" | "invalid">("valid")
  const [currentStep, setCurrentStep] = useState<"upload" | "naming" | "processing" | "results">("upload")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const emailListRef = useRef<HTMLDivElement>(null)

  // Add new state and refs for live progress
  const liveProgressRef = useRef<HTMLDivElement>(null)
  const currentEmailRef = useRef<HTMLDivElement>(null)
  const recentActivityRef = useRef<HTMLDivElement>(null)

  // Add new destructured properties from useBackgroundProcess
  const {
    isProcessing,
    progress,
    result,
    startProcess,
    cancelProcess,
    resetProcess,
    error: processError,
    listTitle: backgroundListTitle,
    emailStatuses,
    currentEmailIndex,
    estimatedTimeRemaining,
    processedCount,
    totalCount,
    currentlyProcessingEmail,
    processingSpeed,
    recentlyCompletedEmails,
  } = useBackgroundProcess()

  // Update current step based on state
  useEffect(() => {
    if (result) {
      setCurrentStep("results")
    } else if (isProcessing) {
      setCurrentStep("processing")
    } else if (file && !listTitle.trim()) {
      setCurrentStep("naming")
    } else if (file && listTitle.trim()) {
      setCurrentStep("naming")
    } else {
      setCurrentStep("upload")
    }
  }, [file, listTitle, isProcessing, result])

  // GSAP Animations
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const ctx = gsap.context(() => {
        gsap.set(modalRef.current, { scale: 0.8, opacity: 0, rotationY: -15 })
        gsap.to(modalRef.current, {
          scale: 1,
          opacity: 1,
          rotationY: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        })

        // Animate content elements
        gsap.from(".modal-element", {
          y: 30,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.2,
          ease: "power2.out",
        })

        // Glowing border animation
        if (glowRef.current) {
          gsap.to(glowRef.current, {
            rotation: 360,
            duration: 8,
            repeat: -1,
            ease: "none",
          })
        }
      }, modalRef)

      return () => ctx.revert()
    }
  }, [isOpen])

  // Progress bar animation
  useEffect(() => {
    if (progressBarRef.current && isProcessing) {
      gsap.to(progressBarRef.current, {
        width: `${progress}%`,
        duration: 0.5,
        ease: "power2.out",
      })
    }
  }, [progress, isProcessing])

  // Auto-scroll to current email being processed
  useEffect(() => {
    if (emailListRef.current && isProcessing && currentEmailIndex >= 0) {
      const emailElement = emailListRef.current.querySelector(`[data-email-index="${currentEmailIndex}"]`)
      if (emailElement) {
        emailElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [currentEmailIndex, isProcessing])

  // Add animation for current email being processed
  useEffect(() => {
    if (currentEmailRef.current && currentlyProcessingEmail) {
      gsap.fromTo(
        currentEmailRef.current,
        { scale: 0.95, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" },
      )
    }
  }, [currentlyProcessingEmail])

  // Add animation for recently completed emails
  useEffect(() => {
    if (recentActivityRef.current && recentlyCompletedEmails.length > 0) {
      const items = recentActivityRef.current.querySelectorAll(".recent-item")
      gsap.fromTo(items, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" })
    }
  }, [recentlyCompletedEmails])

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const resetValidationState = () => {
    setFile(null)
    setListTitle("")
    setShowPayment(false)
    setError(null)
    setCurrentStep("upload")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (!isProcessing) {
      resetProcess()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== "text/csv") {
      setError("Please upload a valid CSV file")
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const handleStartValidation = async () => {
    if (!file || !listTitle.trim()) {
      setError("Please provide both file and list title")
      return
    }

    if (hasUsedFreeTier) {
      setShowPayment(true)
      return
    }

    await startProcess(file, listTitle.trim())
  }

  const handleCancelValidation = () => {
    cancelProcess()
    resetValidationState()
  }

  const handleClose = () => {
    if (isProcessing) {
      onClose()
    } else {
      resetValidationState()
      onClose()
    }
  }

  const handleMinimize = () => {
    onClose()
  }

  interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    handler: () => void
    prefill: {
      name: string
      email: string
    }
    theme: {
      color: string
    }
  }

  interface Razorpay {
    new (options: RazorpayOptions): { open: () => void }
  }

  interface WindowWithRazorpay extends Window {
    Razorpay: Razorpay
  }

  const handlePayment = () => {
    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_12345",
      amount: 10000,
      currency: "INR",
      name: "CogniMail",
      description: "Email Validation Payment",
      handler: async () => {
        setShowPayment(false)
        if (file && listTitle) {
          await startProcess(file, listTitle.trim())
        }
        onPaymentSuccess()
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
      },
      theme: {
        color: "#34D399",
      },
    }

    const rzp = new (window as unknown as WindowWithRazorpay).Razorpay(options)
    rzp.open()
  }

  const downloadCSV = (emails: string[], filename: string) => {
    const csvContent = [["Email Address"], ...emails.map((email) => [email])].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusIcon = (status: EmailStatus["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-400" />
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: EmailStatus["status"]) => {
    switch (status) {
      case "pending":
        return "border-gray-600 bg-gray-800/30"
      case "processing":
        return "border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/20"
      case "completed":
        return "border-emerald-500 bg-emerald-900/20"
      case "failed":
        return "border-red-500 bg-red-900/20"
      default:
        return "border-gray-600 bg-gray-800/30"
    }
  }

  const renderEmailProcessingList = () => (
    <div
      ref={emailListRef}
      className="modal-element max-h-[400px] overflow-y-auto rounded-2xl border border-gray-700/30 bg-gray-900/50 backdrop-blur-sm"
    >
      <div className="p-4 border-b border-gray-700/30 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-200">Email Verification Progress</h3>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>
              {processedCount} / {totalCount} processed
            </span>
            {estimatedTimeRemaining > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(estimatedTimeRemaining)} remaining</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-700/20">
        {emailStatuses.map((emailStatus, index) => (
          <div
            key={index}
            data-email-index={index}
            className={`flex items-center justify-between p-4 transition-all duration-300 border-l-4 ${getStatusColor(emailStatus.status)} ${
              index === currentEmailIndex ? "transform scale-[1.02]" : ""
            }`}
          >
            <div className="flex items-center gap-3 flex-grow min-w-0">
              {getStatusIcon(emailStatus.status)}
              <span className="text-sm text-gray-200 truncate font-mono">{emailStatus.email}</span>
            </div>

            <div className="flex items-center gap-3">
              {emailStatus.processingTime && (
                <span className="text-xs text-gray-500">{emailStatus.processingTime}ms</span>
              )}

              {emailStatus.result && (
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    emailStatus.result.score >= 90 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {emailStatus.result.score >= 90 ? "Valid" : "Invalid"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderEmailList = (emails: string[], isValid: boolean) => (
    <div className="modal-element max-h-[350px] overflow-y-auto rounded-2xl border border-gray-700/30 bg-gray-900/50 backdrop-blur-sm">
      {emails.length > 0 ? (
        <div className="divide-y divide-gray-700/20">
          {emails.map((email, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 transition-all duration-300 hover:bg-gray-800/30 ${
                isValid ? "hover:bg-emerald-900/10" : "hover:bg-red-900/10"
              }`}
            >
              <span className="flex-grow text-sm text-gray-200 truncate font-mono">{email}</span>
              <div className={`p-2 rounded-full ${isValid ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                {isValid ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              isValid ? "bg-emerald-500/20" : "bg-red-500/20"
            }`}
          >
            {isValid ? (
              <Check className="w-8 h-8 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            )}
          </div>
          <p className="text-gray-400 font-medium">No {isValid ? "valid" : "invalid"} emails found.</p>
        </div>
      )}
    </div>
  )

  // Add new component for live processing display
  const renderLiveProcessingDisplay = () => (
    <div className="modal-element space-y-6">
      {/* Current Processing Status */}
      <div className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-700/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-300">Currently Processing</h3>
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>{processingSpeed} emails/sec</span>
          </div>
        </div>

        {currentlyProcessingEmail && (
          <div
            ref={currentEmailRef}
            className="flex items-center gap-4 p-4 bg-blue-900/20 rounded-xl border border-blue-500/30"
          >
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-200 font-mono text-lg">{currentlyProcessingEmail}</span>
            <div className="ml-auto">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Processing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-xl border border-emerald-700/30">
          <div className="text-sm text-emerald-400 font-medium mb-1">Processed</div>
          <div className="text-2xl font-bold text-emerald-300">{processedCount}</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl border border-blue-700/30">
          <div className="text-sm text-blue-400 font-medium mb-1">Remaining</div>
          <div className="text-2xl font-bold text-blue-300">{totalCount - processedCount}</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-700/30">
          <div className="text-sm text-purple-400 font-medium mb-1">Speed</div>
          <div className="text-2xl font-bold text-purple-300">{processingSpeed}/s</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-xl border border-orange-700/30">
          <div className="text-sm text-orange-400 font-medium mb-1">ETA</div>
          <div className="text-2xl font-bold text-orange-300">{formatTime(estimatedTimeRemaining)}</div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentlyCompletedEmails.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Recently Completed
          </h3>
          <div ref={recentActivityRef} className="space-y-2">
            {recentlyCompletedEmails.map((email, index) => (
              <div
                key={`${email}-${index}`}
                className="recent-item flex items-center gap-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-700/30"
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-emerald-200 font-mono text-sm">{email}</span>
                <div className="ml-auto">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (!isOpen) return null

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9000] flex items-center justify-center p-4">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-lime-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-emerald-400/40 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-green-400/20 rounded-full animate-bounce"></div>
        </div>

        {/* Modal */}
        <div
          ref={modalRef}
          className="relative w-full max-w-5xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Glowing border effect */}
          <div
            ref={glowRef}
            className="absolute -inset-0.5 bg-gradient-to-r from-lime-400/20 via-emerald-500/20 to-green-400/20 rounded-3xl blur-sm opacity-75"
          ></div>

          <div ref={contentRef} className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8">
            {/* Header */}
            <div className="modal-element flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-gray-900" />
                  </div>
                  {isProcessing && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-400 to-green-400">
                    {currentStep === "results"
                      ? "Validation Complete"
                      : currentStep === "processing"
                        ? "Processing Emails"
                        : currentStep === "naming"
                          ? "Name Your List"
                          : "Email Verification"}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {currentStep === "results"
                      ? `"${backgroundListTitle}" results are ready for download`
                      : currentStep === "processing"
                        ? "AI-powered validation in progress"
                        : currentStep === "naming"
                          ? "Give your email list a memorable name"
                          : "Upload your CSV file to begin"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isProcessing && (
                  <button
                    onClick={handleMinimize}
                    className="p-3 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group"
                    title="Minimize (process continues in background)"
                  >
                    <Minimize2 className="w-5 h-5 text-gray-300 group-hover:text-lime-400" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-3 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group"
                >
                  <X className="w-5 h-5 text-gray-300 group-hover:text-red-400" />
                </button>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="modal-element mb-8">
              <div className="flex items-center justify-between">
                {[
                  { key: "upload", label: "Upload", number: 1 },
                  { key: "naming", label: "Name List", number: 2 },
                  { key: "processing", label: "Processing", number: 3 },
                  { key: "results", label: "Results", number: 4 },
                ].map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep === step.key
                          ? "bg-lime-400 text-gray-900 scale-110"
                          : ["upload", "naming", "processing", "results"].indexOf(currentStep) > index
                            ? "bg-emerald-500 text-gray-900"
                            : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {step.number}
                    </div>
                    <span
                      className={`ml-2 text-xs font-medium ${
                        currentStep === step.key ? "text-lime-400" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    {index < 3 && (
                      <div
                        className={`w-12 h-1 mx-3 rounded-full transition-all duration-300 ${
                          ["upload", "naming", "processing", "results"].indexOf(currentStep) > index
                            ? "bg-emerald-500"
                            : "bg-gray-700"
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {(error || processError) && (
              <div className="modal-element mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">{error || processError}</span>
                </div>
              </div>
            )}

            {/* File Upload Step */}
            {currentStep === "upload" && !showPayment && (
              <div className="modal-element mb-8">
                <label className="group relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-600/50 rounded-3xl hover:border-lime-400/50 transition-all duration-500 cursor-pointer bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-400/5 to-emerald-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-lime-400/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-8 h-8 text-lime-400" />
                    </div>
                    <span className="text-lg font-semibold text-gray-200 mb-2">
                      {file ? file.name : "Drop your CSV file here"}
                    </span>
                    <span className="text-sm text-gray-400">Or click to browse • Supports CSV files up to 10MB</span>
                  </div>
                  <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                </label>
              </div>
            )}

            {/* Naming Step */}
            {currentStep === "naming" && file && !showPayment && (
              <div className="modal-element mb-8 space-y-6">
                <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-lime-400" />
                    <h3 className="text-lg font-semibold text-gray-200">Selected File</h3>
                  </div>
                  <p className="text-gray-300 font-mono text-sm">{file.name}</p>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-300 mb-2 block">List Title *</span>
                    <input
                      type="text"
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                      placeholder="e.g., Marketing Campaign Q1, Newsletter Subscribers..."
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder-gray-500 focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300"
                      maxLength={100}
                    />
                    <span className="text-xs text-gray-500 mt-1 block">{listTitle.length}/100 characters</span>
                  </label>
                  <button
                    onClick={handleStartValidation}
                    disabled={!listTitle.trim()}
                    className="w-full group relative bg-gradient-to-r from-lime-400 to-emerald-500 text-gray-900 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-[1.02] font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Start Validation</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-300 to-emerald-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {currentStep === "processing" && (
              <div className="modal-element mb-8 space-y-6">
                <div className="relative">
                  <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/30">
                    <div
                      ref={progressBarRef}
                      className="h-full bg-gradient-to-r from-lime-400 via-emerald-400 to-green-400 rounded-full relative overflow-hidden"
                      style={{ width: "0%" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-lime-400 animate-pulse" />
                      <span className="text-sm font-medium text-gray-300">
                        {isProcessing ? `Processing... ${progress}%` : "Preparing to validate emails"}
                      </span>
                    </div>
                    <button
                      onClick={handleCancelValidation}
                      className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Live Processing Display */}
                {renderLiveProcessingDisplay()}

                {/* Detailed email processing list */}
                {emailStatuses.length > 0 && renderEmailProcessingList()}
              </div>
            )}

            {/* Payment Section */}
            {showPayment && (
              <div className="modal-element mb-8 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-200 mb-2">Upgrade Required</h3>
                  <p className="text-gray-400 mb-6">
                    You've reached your free tier limit. Upgrade to continue validating emails with our premium AI
                    engine.
                  </p>
                  <button
                    onClick={handlePayment}
                    className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-lime-400 to-emerald-500 text-gray-900 font-bold rounded-2xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="relative z-10">Upgrade for ₹100</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-300 to-emerald-400 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            )}

            {/* Results Step */}
            {currentStep === "results" && result && (
              <>
                {/* Stats */}
                <div className="modal-element mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-2xl border border-emerald-700/30 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-emerald-400 font-medium mb-1">Valid Emails</div>
                          <div className="text-3xl font-bold text-emerald-300">{result.validEmails.length}</div>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                          <Check className="w-6 h-6 text-emerald-400" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-2xl border border-red-700/30 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-red-400 font-medium mb-1">Invalid Emails</div>
                          <div className="text-3xl font-bold text-red-300">{result.invalidEmails.length}</div>
                        </div>
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-700/30 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-blue-400 font-medium mb-1">Total Processed</div>
                          <div className="text-3xl font-bold text-blue-300">{result.length}</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="modal-element mb-6">
                  <div className="flex bg-gray-800/50 rounded-2xl p-1 backdrop-blur-sm border border-gray-700/30">
                    <button
                      onClick={() => setActiveTab("valid")}
                      className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
                        activeTab === "valid"
                          ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
                      }`}
                    >
                      Valid Emails ({result.validEmails.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("invalid")}
                      className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
                        activeTab === "invalid"
                          ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
                      }`}
                    >
                      Invalid Emails ({result.invalidEmails.length})
                    </button>
                  </div>
                </div>

                {/* Email List */}
                <div className="mb-8">
                  {activeTab === "valid"
                    ? renderEmailList(result.validEmails, true)
                    : renderEmailList(result.invalidEmails, false)}
                </div>

                {/* Download Buttons */}
                <div className="modal-element space-y-4">
                  <button
                    onClick={() => downloadCSV(result.validEmails, `${backgroundListTitle}_valid_emails.csv`)}
                    className="w-full group relative bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] font-bold"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Valid Emails</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => downloadCSV(result.invalidEmails, `${backgroundListTitle}_invalid_emails.csv`)}
                    className="w-full group relative bg-gradient-to-r from-red-500 to-pink-500 text-gray-900 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-[1.02] font-bold"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Invalid Emails</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default EmailVerificationModal
