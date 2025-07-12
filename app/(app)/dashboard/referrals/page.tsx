"use client"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Copy, Share2, Gift, Users, DollarSign, TrendingUp } from "lucide-react"

export default function Referrals() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [referralCode] = useState("COGNI2024XYZ")
  const [referralStats] = useState({
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 240.5,
    pendingEarnings: 45.0,
    conversionRate: 66.7,
  })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".referral-card", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://cognimail.com/signup?ref=${referralCode}`)
    alert("Referral link copied to clipboard!")
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="referral-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-1">Referral Program</h2>
        <p className="text-gray-400">Earn rewards by referring friends to CogniMail</p>
      </div>

      {/* Referral Link */}
      <div
        className="referral-card bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl p-8 text-gray-900 relative overflow-hidden"
        style={{
          clipPath: "polygon(0% 0%, 90% 0%, 100% 10%, 100% 100%, 10% 100%, 0% 90%)",
        }}
      >
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4">Your Referral Link</h3>
          <div className="bg-gray-900/20 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm break-all font-medium">https://cognimail.com/signup?ref={referralCode}</span>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={copyReferralCode}
                  className="p-2 bg-gray-900/20 rounded-lg hover:bg-gray-900/30 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-900/20 rounded-lg hover:bg-gray-900/30 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm opacity-90 font-medium">
            Share this link with friends and earn $20 for each successful referral!
          </p>
        </div>
        <div className="absolute bottom-4 right-4 w-16 h-16 bg-gray-900/10 rounded-full"></div>
        <div className="absolute top-4 right-4 w-8 h-8 bg-gray-900/10 rounded-full"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total Referrals",
            value: referralStats.totalReferrals,
            icon: Users,
            color: "bg-blue-500/20",
            iconColor: "text-blue-400",
          },
          {
            label: "Active Referrals",
            value: referralStats.activeReferrals,
            icon: Gift,
            color: "bg-green-500/20",
            iconColor: "text-green-400",
          },
          {
            label: "Total Earnings",
            value: `$${referralStats.totalEarnings}`,
            icon: DollarSign,
            color: "bg-yellow-500/20",
            iconColor: "text-yellow-400",
          },
          {
            label: "Pending",
            value: `$${referralStats.pendingEarnings}`,
            icon: DollarSign,
            color: "bg-orange-500/20",
            iconColor: "text-orange-400",
          },
          {
            label: "Conversion",
            value: `${referralStats.conversionRate}%`,
            icon: TrendingUp,
            color: "bg-purple-500/20",
            iconColor: "text-purple-400",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="referral-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* How it Works */}
      <div className="referral-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-6">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold text-blue-400">1</span>
            </div>
            <h4 className="font-bold text-white mb-2">Share Your Link</h4>
            <p className="text-sm text-gray-400">Share your unique referral link with friends and colleagues</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold text-green-400">2</span>
            </div>
            <h4 className="font-bold text-white mb-2">They Sign Up</h4>
            <p className="text-sm text-gray-400">Your friends create an account and start using CogniMail</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold text-yellow-400">3</span>
            </div>
            <h4 className="font-bold text-white mb-2">Earn Rewards</h4>
            <p className="text-sm text-gray-400">Get $20 for each successful referral that subscribes</p>
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="referral-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-6">Recent Referrals</h3>
        <div className="space-y-4">
          {[
            { email: "john@example.com", date: "2024-01-20", status: "Active", earnings: "$20.00" },
            { email: "sarah@example.com", date: "2024-01-18", status: "Active", earnings: "$20.00" },
            { email: "mike@example.com", date: "2024-01-15", status: "Pending", earnings: "$0.00" },
            { email: "lisa@example.com", date: "2024-01-12", status: "Active", earnings: "$20.00" },
          ].map((referral, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-600/50 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{referral.email.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-white">{referral.email}</p>
                  <p className="text-sm text-gray-400">Joined {referral.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    referral.status === "Active"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {referral.status}
                </span>
                <p className="text-sm text-gray-400 mt-1">{referral.earnings}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
