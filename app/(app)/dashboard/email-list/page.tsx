"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"
import { gsap } from "gsap"
import { Upload, Download, Users, CheckCircle, XCircle, Plus, Search, Filter, Eye, Edit, Trash2, Clock, X } from "lucide-react"
import { getUserData, updateEmailListResults, UserData, EmailList } from "@/lib/firebaseService"
import { Timestamp } from "firebase/firestore"
import LoadingIndicator from "@/components/loading-indicator"
import { useUser } from "@clerk/nextjs"


export default function Contacts() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("lists")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [viewEmailsListId, setViewEmailsListId] = useState<string | null>(null)

    const { user } = useUser()


  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
        gsap.from(".list-card", {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        })
      }, containerRef)

      return () => ctx.revert()
    }
  }, [loading, userData])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && userData) {
      try {
        // Simulate email verification (in a real app, this would call an API)
        const emails = ["safo51@pleines.org", "safo59@pleines.org", "invalid@example.com"] // Mock data
        const validEmails = emails.filter(email => email.includes("safo")) // Mock validation
        const invalidEmails = emails.filter(email => !email.includes("safo"))
        
        const newList: EmailList = {
          id: `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: file.name,
          validEmails,
          invalidEmails,
          totalEmails: emails.length,
          createdAt: Timestamp.now(),
          status: "completed",
        }

        await updateEmailListResults(userData.id, newList.id, validEmails, invalidEmails)
        setUserData(prev => ({
          ...prev!,
          emailLists: [...prev!.emailLists, newList],
          totalValidEmails: prev!.totalValidEmails + validEmails.length,
          totalInvalidEmails: prev!.totalInvalidEmails + invalidEmails.length,
        }))
        alert(`File "${file.name}" uploaded successfully! Verification completed.`)
      } catch (error) {
        console.error("Error uploading file:", error)
        alert("Failed to process file.")
      }
    }
  }

  const handleEditList = async (listId: string, newName: string) => {
    if (userData) {
      try {
        const updatedLists = userData.emailLists.map(list =>
          list.id === listId ? { ...list, title: newName } : list
        )
        await updateEmailListResults(userData.id, listId, updatedLists.find(l => l.id === listId)!.validEmails, updatedLists.find(l => l.id === listId)!.invalidEmails)
        setUserData({ ...userData, emailLists: updatedLists })
        setEditingListId(null)
        setEditName("")
      } catch (error) {
        console.error("Error updating list:", error)
        alert("Failed to update list name.")
      }
    }
  }

  const scrollY = window.scrollY;

  const handleExportEmails = (list: EmailList) => {
    const csvContent = ["Email", ...list.validEmails].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${list.title}_valid_emails.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteList = async (listId: string) => {
    if (userData && window.confirm("Are you sure you want to delete this list?")) {
      try {
        const listToDelete = userData.emailLists.find(l => l.id === listId)
        if (listToDelete) {
          const updatedLists = userData.emailLists.filter(l => l.id !== listId)
          await updateEmailListResults(userData.id, listId, [], []) // Clear list data
          setUserData({
            ...userData,
            emailLists: updatedLists,
            totalValidEmails: userData.totalValidEmails - listToDelete.validEmails.length,
            totalInvalidEmails: userData.totalInvalidEmails - listToDelete.invalidEmails.length,
          })
        }
      } catch (error) {
        console.error("Error deleting list:", error)
        alert("Failed to delete list.")
      }
    }
  }

  if (loading) {
    return <LoadingIndicator />
  }

  if (!userData) {
    return <div className="text-white">No user data found</div>
  }

  const totalContacts = userData.totalValidEmails + userData.totalInvalidEmails
  const filteredLists = userData.emailLists.filter(list =>
    list.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
    
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="list-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Contact Management</h2>
            <p className="text-gray-400">Manage your email contact lists for {userData.fullName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("upload")}
              className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-gray-900 rounded-xl font-medium hover:bg-lime-300 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload List
            </button>
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
              <h3 className="text-2xl font-bold text-white">{userData.totalValidEmails.toLocaleString()}</h3>
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
              <h3 className="text-2xl font-bold text-white">{userData.totalInvalidEmails.toLocaleString()}</h3>
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
            Email Lists ({filteredLists.length})
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                {filteredLists.map((list) => (
                  <div
                    key={list.id}
                    className="bg-gray-700/30 border border-gray-600/30 rounded-2xl p-6 hover:border-gray-500/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            list.status === "completed"
                              ? "bg-green-500/20"
                              : list.status === "processing"
                              ? "bg-yellow-500/20"
                              : "bg-red-500/20"
                          }`}
                        >
                          {list.status === "completed" && <CheckCircle className="w-6 h-6 text-green-400" />}
                          {list.status === "processing" && <Clock className="w-6 h-6 text-yellow-400 animate-spin" />}
                          {list.status === "failed" && <XCircle className="w-6 h-6 text-red-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {editingListId === list.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-gray-700/50 border border-gray-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter" && editName.trim()) {
                                    handleEditList(list.id, editName.trim())
                                  }
                                }}
                              />
                            ) : (
                              <h3 className="text-xl font-bold text-white">{list.title}</h3>
                            )}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                list.status === "completed"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : list.status === "processing"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {list.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Uploaded: {new Date(list.createdAt.toDate()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewEmailsListId(list.id)}
                          className="p-2 bg-gray-600/50 rounded-xl hover:bg-gray-500/50 transition-colors text-gray-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingListId(list.id)
                            setEditName(list.title)
                          }}
                          className="p-2 bg-gray-600/50 rounded-xl hover:bg-gray-500/50 transition-colors text-gray-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportEmails(list)}
                          className="p-2 bg-gray-600/50 rounded-xl hover:bg-gray-500/50 transition-colors text-gray-400 hover:text-white"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="p-2 bg-gray-600/50 rounded-xl hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400"
                        >
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
                        <p className="text-xl font-bold text-green-400">{list.validEmails.length.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Valid</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-red-400">{list.invalidEmails.length.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Invalid</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-lime-400">
                          {list.status === "processing" ? "..." : `${((list.validEmails.length / (list.totalEmails || 1)) * 100).toFixed(1)}%`}
                        </p>
                        <p className="text-gray-400 text-sm">Success Rate</p>
                      </div>
                    </div>

                    {list.status !== "processing" && (
                      <div className="w-full bg-gray-600/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-lime-400 to-green-500 rounded-full h-2 transition-all duration-1000"
                          style={{ width: `${(list.validEmails.length / (list.totalEmails || 1)) * 100}%` }}
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

      {/* Modal for Viewing Valid Emails */}
 {viewEmailsListId && (
<div
  className="fixed inset-0 bg-transparent backdrop-blur-lg flex items-start justify-center z-50"
  style={{ top: `${scrollY}px` }}
>    <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          Valid Emails for {userData.emailLists.find(l => l.id === viewEmailsListId)?.title}
        </h3>
        <button
          onClick={() => setViewEmailsListId(null)}
          className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-600/50"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="space-y-2">
        {userData.emailLists
          .find(l => l.id === viewEmailsListId)
          ?.validEmails.map((email, index) => (
            <div key={index} className="bg-gray-700/30 p-3 rounded-xl text-white">
              {email}
            </div>
          ))}
      </div>
    </div>
  </div>
)}

    </div>
  )
}