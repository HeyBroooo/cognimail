"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import type React from "react"
import { gsap } from "gsap"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense } from "react"
import { LayoutDashboard, FileText, Users, Gift, CreditCard, Zap, LogOut, Menu, X, Bell, Settings } from "lucide-react"
import { useUser, useClerk } from "@clerk/nextjs"
import LoadingIndicator from "@/components/loading-indicator"
import EmailVerificationModal from "@/components/EmailVerificationModal"
import FloatingProgressIndicator from "@/components/FloatingProgressIndicator"
import { useBackgroundProcess } from "@/hooks/useBackgroundProcess"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: FileText, label: "Templates", href: "/dashboard/templates" },
  { icon: Users, label: "Contacts", href: "/dashboard/contacts" },
  { icon: Gift, label: "Referrals", href: "/dashboard/referrals" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Zap, label: "Upgrade", href: "/dashboard/upgrade" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { isProcessing } = useBackgroundProcess()

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // Force FloatingProgressIndicator visibility when modal closes during processing
  useEffect(() => {
    if (isProcessing && !isVerifyModalOpen) {
      // Ensure indicator is visible when modal is closed during processing
      const timer = setTimeout(() => {
        // Force a re-render to ensure the floating indicator appears
        console.log("Modal closed during processing - floating indicator should be visible")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isProcessing, isVerifyModalOpen])

  useEffect(() => {
    // Redirect to login if user is not signed in
    if (isLoaded && !isSignedIn) {
      router.push("/login")
    }

    const ctx = gsap.context(() => {
      // Reset and animate sidebar items
      gsap.set(".nav-item", { x: 0, opacity: 1 })
      gsap.from(".nav-item", {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      })

      gsap.from(".main-content", {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [pathname, isLoaded, isSignedIn, router])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const openVerifyEmail = () => {
    setIsVerifyModalOpen(true)
  }

  const handlePaymentSuccess = useCallback(() => {
    console.log("Payment successful")
  }, [])

  const handleMaximizeModal = () => {
    setIsVerifyModalOpen(true)
  }

  if (!isLoaded) {
    return <LoadingIndicator />
  }

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-gray-900 text-white flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800/90 backdrop-blur-xl border-r border-gray-700/50 transform transition-transform duration-300 ease-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-700/50">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-gray-900 font-bold text-lg">C</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CogniMail</h1>
                  <p className="text-xs text-gray-400">Email Marketing</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? "bg-lime-400/20 text-lime-400 border border-lime-400/30 shadow-lg shadow-lime-400/10"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border hover:border-gray-600/30"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-lime-400" : "text-gray-400 group-hover:text-white"}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 bg-lime-400 rounded-full"></div>}
                  </Link>
                )
              })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-700/50">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700/50 transition-colors mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress || "User"}
                  </p>
                  <p className="text-xs text-gray-400">Free Plan</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-gray-800/30 backdrop-blur-xl border-b border-gray-700/50 px-4 lg:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {sidebarItems.find((item) => item.href === pathname)?.label || "Dashboard"}
                  </h1>
                  <p className="text-sm text-gray-400 hidden sm:block">
                    Welcome back! Here's what's happening with your campaigns.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={openVerifyEmail}
                    className="nav-item group relative inline-block text-sm font-medium text-black focus:ring-3 focus:outline-hidden cursor-pointer"
                  >
                    <span className="absolute inset-0 border border-green-200 rounded-2xl transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1"></span>
                    <div className="block border text-sm font-medium font-mono rounded-2xl border-lime-300 bg-lime-400 px-12 py-3 transition-transform duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1">
                      Verify Emails
                    </div>
                  </button>
                </div>
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <Bell className="w-5 h-5 text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-lime-400 rounded-full animate-pulse"></span>
                </button>
                {/* Settings */}
                <button className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <Settings className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="main-content flex-1 p-4 lg:p-6 bg-gray-900">
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </main>
        </div>

        {/* Email Verification Modal */}
        <EmailVerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
          hasUsedFreeTier={false}
        />
      </div>

      {/* Floating Progress Indicator - Moved outside main container with highest z-index */}
      <div className="fixed inset-0 pointer-events-none z-[10000]">
        <FloatingProgressIndicator onMaximize={handleMaximizeModal} />
      </div>
    </>
  )
}