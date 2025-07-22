"use client"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"
import { Plus, CheckCircle, Clock, Send, Users } from "lucide-react"
import { getUserData, UserData } from "@/lib/firebaseService"
import { useUser } from "@clerk/nextjs"
import LoadingIndicator from "@/components/loading-indicator"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Helper function to get last 7 days of verification data
const getVerificationTrend = (emailLists: UserData["emailLists"]) => {
  const trend = Array(7).fill({ valid: 0, invalid: 0 })
  const today = new Date()
  
  emailLists.forEach((list) => {
    const createdDate = list.createdAt.toDate()
    const diffDays = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays >= 0 && diffDays < 7) {
      trend[6 - diffDays].valid += list.validEmails.length
      trend[6 - diffDays].invalid += list.invalidEmails.length
    }
  })
  
  return trend
}

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const { user } = useUser()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Assuming userId is available (you might want to get this from auth context)
        const userId = user?.id
        if (!userId) {
          setLoading(false)
          console.error("User ID is undefined")
          return
        }
        const data = await getUserData(userId)
        setUserData(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setLoading(false)
      }
    }

    console.log("Fetching user data...", user)

    fetchUserData()
  }, [])

  useEffect(() => {
    if (!loading && userData) {
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
    }
  }, [loading, userData])

  if (loading) {
    return <LoadingIndicator />
  }

  if (!userData) {
    return <div className="text-white">No user data found</div>
  }

  const verificationTrend = getVerificationTrend(userData.emailLists)
  const totalEmails = userData.totalValidEmails + userData.totalInvalidEmails
  const activeCampaigns = userData.emailLists.filter(list => list.status === "processing").length
  const completedCampaigns = userData.emailLists.filter(list => list.status === "completed").length
  const validRate = totalEmails > 0 ? ((userData.totalValidEmails / totalEmails) * 100).toFixed(1) : 0

  // Chart.js data for Verification Trends
  const chartData = {
    labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Valid Emails",
        data: verificationTrend.map(data => data.valid),
        backgroundColor: "#84cc16",
        borderColor: "#84cc16",
        borderWidth: 1,
      },
      {
        label: "Invalid Emails",
        data: verificationTrend.map(data => data.invalid),
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#ffffff",
        },
      },
      title: {
        display: true,
        text: "Email Verification Trends",
        color: "#ffffff",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "#374151",
        },
      },
      x: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "#374151",
        },
      },
    },
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Welcome, {userData.fullName}</p>
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
        {/* Total Emails Card */}
        <div className="col-span-12 lg:col-span-3">
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Total Emails Processed</h3>
            </div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white">{totalEmails.toLocaleString()}</h2>
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
                <h3 className="text-gray-900 text-sm font-medium">Active Campaigns</h3>
              </div>
              <div className="mb-4">
                <h2 className="text-4xl font-bold text-gray-900">{activeCampaigns}</h2>
                <p className="text-gray-800 text-sm">Email Campaigns</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-900/20 rounded-lg px-3 py-1">
                  <span className="text-gray-900 text-sm font-medium">{completedCampaigns} Completed</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-gray-900/10 rounded-full"></div>
            <div className="absolute top-4 right-4 w-8 h-8 bg-gray-900/10 rounded-full"></div>
          </div>
        </div>

        {/* Verification Rate */}
        <div className="col-span-12 lg:col-span-2">
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Verification Rate</h3>
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
                    strokeDasharray={`${validRate}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{validRate}%</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Valid Emails</p>
            </div>
          </div>
        </div>

        {/* Recent Campaigns List */}
        <div className="col-span-12 lg:col-span-3">
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Recent Campaigns</h3>
            </div>
            <div className="space-y-4">
              {userData.emailLists.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{campaign.title}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(campaign.createdAt.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lime-400 font-bold">{campaign.validEmails.length}</p>
                    <p className="text-gray-400 text-xs">valid emails</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Trends Overview */}
        <div className="col-span-12 lg:col-span-7">
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Verification Trends Overview</h3>
            </div>

            {/* Chart Area */}
            <div className="relative h-48 mb-6">
              <Bar data={chartData} options={chartOptions} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold text-white">{userData.totalValidEmails.toLocaleString()}</h4>
                <p className="text-green-400 text-sm flex items-center gap-1">
                  <span>{validRate}% Valid Rate</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Total Processed</p>
                <p className="text-white font-medium">{totalEmails.toLocaleString()}</p>
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
                  <p className="text-white font-bold text-lg">{totalEmails.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">Emails Processed</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <span>{validRate}%</span>
              </div>
            </div>

            <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{userData.totalValidEmails.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">Valid Emails</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <span>{validRate}%</span>
              </div>
            </div>

            <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{validRate}%</p>
                  <p className="text-gray-400 text-xs">Valid Rate</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <span>{validRate}%</span>
              </div>
            </div>

            <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{userData.totalInvalidEmails.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">Invalid Emails</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <span>{((userData.totalInvalidEmails / totalEmails) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {userData.emailLists.slice(0, 4).map((list, index) => (
                <div key={index} className="metric-item flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Campaign "{list.title}" {list.status}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(list.createdAt.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}