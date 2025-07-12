"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"
import { gsap } from "gsap"
import {
  Upload,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
} from "lucide-react"

export default function Contacts() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("lists")
  const [emailLists] = useState([
    {
      id: 1,
      name: "Newsletter Subscribers",
      totalEmails: 12450,
      validEmails: 11680,
      invalidEmails: 770,
      status: "Verified",
      uploadDate: "2024-01-15",
      lastVerified: "2024-01-20",
      verificationRate: 93.8,
    },
    {
      id: 2,
      name: "Product Launch Campaign",
      totalEmails: 8520,
      validEmails: 8100,
      invalidEmails: 420,
      status: "Verified",
      uploadDate: "2024-01-10",
      lastVerified: "2024-01-18",
      verificationRate: 95.1,
    },
    {
      id: 3,
      name: "Customer Feedback List",
      totalEmails: 4500,
      validEmails: 0,
      invalidEmails: 0,
      status: "Processing",
      uploadDate: "2024-01-22",
      lastVerified: null,
      verificationRate: 0,
    },
  ])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".list-card", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      alert(`File "${file.name}" uploaded successfully! Verification in progress...`)
    }
  }

  const totalContacts = emailLists.reduce((sum, list) => sum + list.totalEmails, 0)
  const totalValid = emailLists.reduce((sum, list) => sum + list.validEmails, 0)
  const totalInvalid = emailLists.reduce((sum, list) => sum + list.invalidEmails, 0)

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="list-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Contact Management</h2>
            <p className="text-gray-400">Upload, verify, and manage your email contact lists</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-600/50 transition-colors border border-gray-600/50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-gray-900 rounded-xl font-medium hover:bg-lime-300 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload List
              <input type="file" accept=".csv,.xlsx,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="list-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{totalContacts.toLocaleString()}</h3>
              <p className="text-gray-400 text-sm">Total Contacts</p>
            </div>
          </div>
        </div>

        <div className="list-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{totalValid.toLocaleString()}</h3>
              <p className="text-gray-400 text-sm">Valid Emails</p>
            </div>
          </div>
        </div>

        <div className="list-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{totalInvalid.toLocaleString()}</h3>
              <p className="text-gray-400 text-sm">Invalid Emails</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="list-card bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="flex border-b border-gray-700/50">
          <button
            onClick={() => setActiveTab("lists")}
            className={`px-6 py-4 text-sm font-medium transition-all ${
              activeTab === "lists"
                ? "bg-lime-400/20 text-lime-400 border-b-2 border-lime-400"
                : "text-gray-400 hover:text-white hover:bg-gray-700/30"
            }`}
          >
            Email Lists ({emailLists.length})
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-4 text-sm font-medium transition-all ${
              activeTab === "upload"
                ? "bg-lime-400/20 text-lime-400 border-b-2 border-lime-400"
                : "text-gray-400 hover:text-white hover:bg-gray-700/30"
            }`}
          >
            Upload New List
          </button>
        </div>

        <div className="p-6">
          {activeTab === "lists" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search email lists..."
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all placeholder-gray-400"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl hover:bg-gray-600/50 transition-colors text-gray-300 hover:text-white">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {/* Email Lists */}
              <div className="space-y-4">
                {emailLists.map((list) => (
                  <div
                    key={list.id}
                    className="bg-gray-700/30 border border-gray-600/30 rounded-2xl p-6 hover:border-gray-500/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            list.status === "Verified"
                              ? "bg-green-500/20"
                              : list.status === "Processing"
                                ? "bg-yellow-500/20"
                                : "bg-red-500/20"
                          }`}
                        >
                          {list.status === "Verified" && <CheckCircle className="w-6 h-6 text-green-400" />}
                          {list.status === "Processing" && <Clock className="w-6 h-6 text-yellow-400 animate-spin" />}
                          {list.status === "Failed" && <XCircle className="w-6 h-6 text-red-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{list.name}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                list.status === "Verified"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : list.status === "Processing"
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {list.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Uploaded: {list.uploadDate}</span>
                            {list.lastVerified && <span>Verified: {list.lastVerified}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-gray-600/50 rounded-xl hover:bg-gray-500/50 transition-colors text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-600/50 rounded-xl hover:bg-gray-500/50 transition-colors text-gray-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-600/50 rounded-xl hover:bg-gray-500/50 transition-colors text-gray-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-600/50 rounded-xl hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-white">{list.totalEmails.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-400">{list.validEmails.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Valid</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-red-400">{list.invalidEmails.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Invalid</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-lime-400">
                          {list.status === "Processing" ? "..." : `${list.verificationRate}%`}
                        </p>
                        <p className="text-gray-400 text-sm">Success Rate</p>
                      </div>
                    </div>

                    {list.status !== "Processing" && (
                      <div className="w-full bg-gray-600/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-lime-400 to-green-500 rounded-full h-2 transition-all duration-1000"
                          style={{ width: `${list.verificationRate}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="border-2 border-dashed border-gray-600/50 rounded-2xl p-12 mb-6 hover:border-lime-400/50 transition-colors">
                <label className="cursor-pointer">
                  <input type="file" accept=".csv,.xlsx,.txt" onChange={handleFileUpload} className="hidden" />
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">Drop your file here or click to browse</p>
                      <p className="text-gray-400">Supported formats: CSV, XLSX, TXT</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="text-left bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                <h4 className="font-bold text-white mb-3">File Requirements:</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Maximum file size: 10MB</li>
                  <li>• Email addresses should be in the first column</li>
                  <li>• One email address per row</li>
                  <li>• Headers are optional but recommended</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
