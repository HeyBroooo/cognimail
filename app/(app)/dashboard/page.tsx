"use client"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  Mail,
  Users,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Eye,
  MousePointer,
  Send,
  CheckCircle,
  Clock,
  Plus,
  BarChart3,
} from "lucide-react"

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [stats] = useState({
    totalEmails: 23000,
    totalContacts: 8420,
    openRate: 32.4,
    clickRate: 4.8,
    emailsThisMonth: 2450,
    monthlyLimit: 5000,
    activeCampaigns: 24,
    weeklyEngagement: 45,
    revenue: 34200,
  })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dashboard-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })

      gsap.from(".metric-item", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.3,
        ease: "back.out(1.7)",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])


  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          
          <button className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-gray-900 rounded-lg hover:bg-lime-300 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Total Sales Card */}
        <div className="col-span-12 lg:col-span-3">
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Total Sales</h3>
              <div className="flex gap-2">
                <button className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-gray-400" />
                </button>
                <button className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <ArrowUp className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">${stats.totalEmails.toLocaleString()}</h2>
              <div className="w-full bg-lime-400 h-2 rounded-full"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Sat</span>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
            </div>
          </div>
        </div>

        {/* Active Campaign Card */}
        <div className="col-span-12 lg:col-span-4">
          <div
            className="dashboard-card bg-lime-400 rounded-2xl p-6 h-full relative overflow-hidden"
            style={{
              clipPath: "polygon(0% 0%, 85% 0%, 100% 12%, 110% 100%, 15% 100%, 0% 85%)",
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 text-sm font-medium">Active Campaign</h3>
                <div className="flex gap-2">
                  <button className="w-6 h-6 rounded-full bg-gray-900/20 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-gray-900" />
                  </button>
                  <button className="w-6 h-6 rounded-full bg-gray-900/20 flex items-center justify-center">
                    <ArrowUp className="w-3 h-3 text-gray-900" />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <h2 className="text-4xl font-bold text-gray-900 mb-1">{stats.activeCampaigns}</h2>
                <p className="text-gray-800 text-sm">Email Campaigns</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-900/20 rounded-lg px-3 py-1">
                  <span className="text-gray-900 text-sm font-medium">30%</span>
                </div>
                <div className="bg-gray-900/20 rounded-lg px-3 py-1">
                  <span className="text-gray-900 text-sm font-medium">45%</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-gray-900/10 rounded-full"></div>
            <div className="absolute top-4 right-4 w-8 h-8 bg-gray-900/10 rounded-full"></div>
          </div>
        </div>

        {/* Weekly Engagement */}
        <div className="col-span-12 lg:col-span-2">
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Weekly Engagement</h3>
              <div className="flex gap-2">
                <button className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-gray-400" />
                </button>
                <button className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <ArrowUp className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#84cc16"
                    strokeWidth="2"
                    strokeDasharray={`${stats.weeklyEngagement}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{stats.weeklyEngagement}</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Mobile App</p>
              <p className="text-gray-400 text-xs">Website</p>
            </div>
          </div>
        </div>

        {/* Active Campaigns List */}
        <div className="col-span-12 lg:col-span-3">
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Active Campaigns</h3>
              <button className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                <ArrowUp className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Gadget Galaxy</p>
                  <p className="text-gray-400 text-xs">Day 1</p>
                </div>
                <div className="text-right">
                  <p className="text-lime-400 font-bold">580</p>
                  <p className="text-gray-400 text-xs">opens</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Summer Steals</p>
                  <p className="text-gray-400 text-xs">Day 2</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">340</p>
                  <p className="text-gray-400 text-xs">clicks</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Product Performance</p>
                  <p className="text-gray-400 text-xs">Day 3</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">220</p>
                  <p className="text-gray-400 text-xs">conversions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Trends Overview */}
        <div className="col-span-12 lg:col-span-7">
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Sales Trends Overview</h3>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                  <ArrowUp className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-48 mb-6">
              <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-between gap-2">
                {[40, 65, 45, 80, 60, 90, 70, 85, 95, 75, 88, 92].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${
                        index === 8 ? "bg-lime-400" : "bg-gray-600"
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="absolute top-4 left-8 bg-lime-400 text-gray-900 px-2 py-1 rounded text-sm font-bold">
                $5,920
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold text-white">${stats.revenue.toLocaleString()}</h4>
                <p className="text-green-400 text-sm flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  2.84% Growth
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">vs last month</p>
                <p className="text-white font-medium">+$2,840</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Cards */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{stats.totalEmails.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">Emails Sent</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-3 h-3" />
                <span>12%</span>
              </div>
            </div>

            <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{stats.totalContacts.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">Contacts</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-3 h-3" />
                <span>8%</span>
              </div>
            </div>

            <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{stats.openRate}%</p>
                  <p className="text-gray-400 text-xs">Open Rate</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-3 h-3" />
                <span>5%</span>
              </div>
            </div>

            <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <MousePointer className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{stats.clickRate}%</p>
                  <p className="text-gray-400 text-xs">Click Rate</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <ArrowDown className="w-3 h-3" />
                <span>2%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                {
                  icon: CheckCircle,
                  color: "text-green-400",
                  bg: "bg-green-500/20",
                  text: "Campaign completed successfully",
                  time: "2 hours ago",
                },
                {
                  icon: Mail,
                  color: "text-blue-400",
                  bg: "bg-blue-500/20",
                  text: "New template created",
                  time: "4 hours ago",
                },
                {
                  icon: Users,
                  color: "text-purple-400",
                  bg: "bg-purple-500/20",
                  text: "1,250 contacts imported",
                  time: "6 hours ago",
                },
                {
                  icon: TrendingUp,
                  color: "text-orange-400",
                  bg: "bg-orange-500/20",
                  text: "Performance improved",
                  time: "1 day ago",
                },
              ].map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="metric-item flex items-start gap-3">
                    <div className={`w-8 h-8 ${activity.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{activity.text}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
