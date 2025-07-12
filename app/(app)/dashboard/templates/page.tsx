"use client"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Eye,
  Plus,
  Grid3X3,
  List,
  Star,
  Calendar,
  Tag,
  TrendingUp,
  Download,
  Share2,
} from "lucide-react"

export default function Templates() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [templates] = useState([
    {
      id: 1,
      name: "Welcome Series - Onboarding",
      subject: "Welcome to CogniMail! Let's get started 🚀",
      createdAt: "2024-01-15",
      lastModified: "2024-01-20",
      status: "Active",
      category: "Welcome",
      opens: 1250,
      clicks: 89,
      thumbnail: "/placeholder.svg?height=200&width=300",
      favorite: true,
    },
    {
      id: 2,
      name: "Monthly Newsletter Template",
      subject: "Your Monthly Digest - January 2024",
      createdAt: "2024-01-10",
      lastModified: "2024-01-18",
      status: "Active",
      category: "Newsletter",
      opens: 2100,
      clicks: 156,
      thumbnail: "/placeholder.svg?height=200&width=300",
      favorite: false,
    },
    {
      id: 3,
      name: "Flash Sale Promotion",
      subject: "⚡ 48-Hour Flash Sale - Up to 70% Off!",
      createdAt: "2024-01-05",
      lastModified: "2024-01-15",
      status: "Draft",
      category: "Promotion",
      opens: 890,
      clicks: 234,
      thumbnail: "/placeholder.svg?height=200&width=300",
      favorite: true,
    },
    {
      id: 4,
      name: "Customer Feedback Request",
      subject: "We'd love your feedback! ⭐",
      createdAt: "2024-01-01",
      lastModified: "2024-01-10",
      status: "Active",
      category: "Follow-up",
      opens: 567,
      clicks: 45,
      thumbnail: "/placeholder.svg?height=200&width=300",
      favorite: false,
    },
  ])

  const categories = ["all", "Welcome", "Newsletter", "Promotion", "Follow-up", "Announcement", "E-commerce"]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".template-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      })

      gsap.from(".filter-item", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Template Library</h1>
          <p className="text-gray-400 mt-1">Manage and organize your email templates</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-gray-900 rounded-xl font-medium hover:bg-lime-300 transition-all duration-200">
          <Plus className="w-5 h-5" />
          Create New Template
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Templates", value: templates.length, icon: Grid3X3, color: "from-blue-500 to-blue-600" },
          {
            label: "Active Templates",
            value: templates.filter((t) => t.status === "Active").length,
            icon: TrendingUp,
            color: "from-green-500 to-green-600",
          },
          {
            label: "Draft Templates",
            value: templates.filter((t) => t.status === "Draft").length,
            icon: Edit,
            color: "from-yellow-500 to-yellow-600",
          },
          {
            label: "Favorites",
            value: templates.filter((t) => t.favorite).length,
            icon: Star,
            color: "from-pink-500 to-pink-600",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="template-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-lime-400/50 focus:bg-gray-700 transition-all placeholder-gray-400"
              placeholder="Search templates by name or subject..."
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400/50 transition-all"
            >
              {categories.map((category) => (
                <option key={category} value={category} className="bg-gray-800">
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-700/50 rounded-xl p-1 border border-gray-600/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="template-card group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-lime-400/5 hover:-translate-y-1 overflow-hidden"
            >
              {/* Template Thumbnail */}
              <div className="relative overflow-hidden">
                <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="text-gray-500 text-4xl font-bold">📧</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      template.favorite
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-black/20 text-gray-400 hover:text-yellow-400"
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      template.status === "Active"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {template.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-4 text-white text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{template.opens.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{template.clicks}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg mb-1 truncate group-hover:text-lime-300 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{template.subject}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{template.category}</span>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{template.lastModified}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-600/50 transition-colors border border-gray-600/30">
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors border border-gray-600/30 text-gray-400 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors border border-gray-600/30 text-gray-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-red-500/20 transition-colors border border-gray-600/30 text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="template-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:shadow-lime-400/5"
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500 text-xl">📧</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                        {template.name}
                        {template.favorite && <Star className="w-4 h-4 text-yellow-400" />}
                      </h3>
                      <p className="text-gray-400 text-sm">{template.subject}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        template.status === "Active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {template.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>{template.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Modified {template.lastModified}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{template.opens.toLocaleString()} opens</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{template.clicks} clicks</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-600/50 transition-colors">
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors text-gray-400 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors text-gray-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors text-gray-400 hover:text-white">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors text-gray-400 hover:text-white">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No templates found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search terms or filters</p>
          <button className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-gray-900 rounded-xl font-medium hover:bg-lime-300 transition-all duration-200 mx-auto">
            <Plus className="w-5 h-5" />
            Create Your First Template
          </button>
        </div>
      )}
    </div>
  )
}
