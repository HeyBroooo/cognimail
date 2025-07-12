"use client"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Save, Eye, Code, Palette, Type, ImageIcon, Smartphone, Monitor, Tablet, Sparkles } from "lucide-react"

export default function CreateTemplate() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [template, setTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    htmlContent: "",
  })
  const [activeTab, setActiveTab] = useState("visual")
  const [previewDevice, setPreviewDevice] = useState("desktop")

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".template-card", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleSave = () => {
    console.log("Saving template:", template)
    alert("Template saved successfully!")
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="template-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Email Template Designer</h2>
              <p className="text-gray-400">Create stunning email templates with our visual editor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-600/50 transition-colors border border-gray-600/50">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-lime-400 text-gray-900 rounded-xl font-medium hover:bg-lime-300 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Template
            </button>
          </div>
        </div>
      </div>

      {/* Template Details */}
      <div className="template-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-blue-400" />
          Template Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all placeholder-gray-400"
              placeholder="Enter a descriptive name for your template"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Subject Line</label>
            <input
              type="text"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all placeholder-gray-400"
              placeholder="Write a compelling subject line"
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="template-card bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="flex border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab("visual")}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all ${
                activeTab === "visual"
                  ? "bg-lime-400/20 text-lime-400 border-b-2 border-lime-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }`}
            >
              <Palette className="w-4 h-4" />
              Visual Editor
            </button>
            <button
              onClick={() => setActiveTab("html")}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all ${
                activeTab === "html"
                  ? "bg-lime-400/20 text-lime-400 border-b-2 border-lime-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }`}
            >
              <Code className="w-4 h-4" />
              HTML Editor
            </button>
          </div>

          <div className="p-6">
            {activeTab === "visual" && (
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg text-sm hover:bg-gray-600/50 transition-colors text-gray-300 hover:text-white border border-gray-600/50">
                    <Type className="w-4 h-4" />
                    Add Text
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg text-sm hover:bg-gray-600/50 transition-colors text-gray-300 hover:text-white border border-gray-600/50">
                    <ImageIcon className="w-4 h-4" />
                    Add Image
                  </button>
                </div>
                <textarea
                  value={template.content}
                  onChange={(e) => setTemplate({ ...template, content: e.target.value })}
                  className="w-full h-96 bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all resize-none placeholder-gray-400"
                  placeholder="Start writing your email content here..."
                />
              </div>
            )}

            {activeTab === "html" && (
              <textarea
                value={template.htmlContent}
                onChange={(e) => setTemplate({ ...template, htmlContent: e.target.value })}
                className="w-full h-96 bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all resize-none font-mono text-sm placeholder-gray-400"
                placeholder="Enter your HTML code here..."
              />
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="template-card bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-400" />
                Live Preview
              </h3>
              <div className="flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === "desktop" ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === "tablet" ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === "mobile" ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                previewDevice === "mobile"
                  ? "max-w-sm mx-auto"
                  : previewDevice === "tablet"
                    ? "max-w-md mx-auto"
                    : "w-full"
              }`}
            >
              <div className="bg-gray-100 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="p-6 min-h-96 text-black">
                {template.subject && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h4 className="font-bold text-lg text-gray-800">{template.subject}</h4>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {template.content || (
                    <div className="text-center text-gray-400 py-12">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your email preview will appear here as you type...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
