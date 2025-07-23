"use client";
import React, { useState, useRef, useEffect } from "react";
import EmailEditor, { EditorRef } from "react-email-editor";
import { gsap } from "gsap";
import { saveTemplate, getUserTemplates } from "../../../../lib/firebaseService";
import TemplateModal from "../../../../components/TemplateModal";
import ConvertModal from "../../../../components/ConvertModal";
import TemplateAnalyzer from "./TemplateAnalyzer";
import InstructionsModal from "../../../../components/InstructionsModal";
import { toast } from "sonner";
import { Plus, Save, Upload, FileText, Eye, Download, Palette, Type, Smartphone, Monitor, Tablet } from "lucide-react";
import MyEmailTemplate from "./MyEmailTemplate.json";
import { Template } from "../../../../types";
import { useUser } from "@clerk/nextjs";

interface Design {
  body: {
    rows: any[];
    values?: { [key: string]: any };
  };
  counters?: { [key: string]: number };
}

const CreateTemplate: React.FC = () => {
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const emailEditorRef = useRef<EditorRef>(null);
  const [template, setTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    htmlContent: "",
  });
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showConvertModal, setShowConvertModal] = useState<boolean>(true);
  const [showAnalyzer, setShowAnalyzer] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [currentHtml, setCurrentHtml] = useState<string>("");
  const [templateScore, setTemplateScore] = useState<number>(100);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".template-card", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const userTemplates = await getUserTemplates(user?.id || "user123");
      setTemplates(userTemplates);
    } catch (error) {
      toast.error("Failed to fetch templates");
    }
  };

  const loadDefaultTemplate = () => {
    const editor = emailEditorRef.current?.editor;
    if (editor) {
      editor.loadDesign({
        ...MyEmailTemplate,
        counters: (MyEmailTemplate as Design).counters ?? {},
      } as any);
      setTemplate({ ...template, htmlContent: "", subject: "", name: "" });
      setCurrentHtml("");
      toast.success("Default template loaded");
    }
  };

  const exportHtml = () => {
    const editor = emailEditorRef.current?.editor;
    if (editor) {
      editor.exportHtml((data) => {
        const { html } = data;
        setCurrentHtml(html);
        setTemplate({ ...template, htmlContent: html });
        setShowAnalyzer(true);
      });
    }
  };

  const saveDesign = async (title: string, plaintext: string) => {
    const editor = emailEditorRef.current?.editor;
    if (editor) {
      setIsLoading(true);
      editor.exportHtml(async (data) => {
        const { design, html } = data;
        try {
          const newTemplate = await saveTemplate(user?.id || "user123", {
            title,
            design,
            html,
            plaintext,
            score: templateScore,
          });
          setTemplates((prev) => [...prev, newTemplate]);
          toast.success("Template saved successfully");
          setShowTemplateModal(false);
        } catch (error) {
          toast.error("Failed to save template");
        } finally {
          setIsLoading(false);
        }
      });
    }
  };

  const loadTemplate = (selectedTemplate: Template) => {
    const editor = emailEditorRef.current?.editor;
    if (editor && selectedTemplate.design) {
      editor.loadDesign({
        ...selectedTemplate.design,
        counters: selectedTemplate.design.counters ?? {},
      });
      setCurrentHtml(selectedTemplate.html);
      setTemplateScore(selectedTemplate.score);
      setTemplate({
        ...template,
        name: selectedTemplate.title,
        htmlContent: selectedTemplate.html,
        subject: selectedTemplate.subject || "",
      });
      toast.success(`Loaded template: ${selectedTemplate.title}`);
    }
  };

  const applyFixedHtml = async (fixedHtml: string) => {
    const editor = emailEditorRef.current?.editor;
    if (editor) {
      try {
        const designJson = await (window as any).puter.ai.chat(
          `Convert the following HTML to Unlayer-compatible JSON design format:\n${fixedHtml}`
        );
        let parsedDesign: Design;
        try {
          parsedDesign = JSON.parse(designJson);
        } catch (e) {
          toast.error("Failed to parse optimized HTML to design JSON");
          return;
        }
        const safeDesign = {
          ...parsedDesign,
          counters: parsedDesign.counters ?? {},
        };
        editor.loadDesign(safeDesign as any);
        setCurrentHtml(fixedHtml);
        setTemplate({ ...template, htmlContent: fixedHtml });
        toast.success("Applied optimized template");
      } catch (error) {
        toast.error("Failed to apply optimized template");
      }
    }
  };

  const downloadHtml = () => {
    if (currentHtml) {
      const blob = new Blob([currentHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.name || "email_template"}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded");
    } else {
      toast.error("No HTML content to download");
    }
  };

  const handleSave = () => {
    if (!template.name.trim()) {
      toast.error("Please provide a template name");
      return;
    }
    setShowTemplateModal(true);
  };

  return (
    <div ref={containerRef} className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="template-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Email Template Designer</h2>
              <p className="text-gray-400">Create stunning email templates with our visual editor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInstructions(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-600/50 transition-colors border border-gray-600/50"
              title="Instructions"
              disabled={isLoading}
            >
              <FileText className="w-4 h-4" />
              Instructions
            </button>
            <button
              onClick={loadDefaultTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-600/50 transition-colors border border-gray-600/50"
              title="Load Default Template"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
            <button
              onClick={() => setShowConvertModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-600/50 transition-colors border border-gray-600/50"
              title="Convert HTML to JSON"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4" />
              Convert HTML
            </button>
            <button
              onClick={exportHtml}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-600/50 transition-colors border border-gray-600/50"
              title="Analyze Template"
              disabled={isLoading}
            >
              <Eye className="w-4 h-4" />
              Analyze
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-lime-400 to-green-500 text-gray-900 rounded-xl font-medium hover:bg-lime-300 transition-colors"
              disabled={isLoading}
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save Template"}
            </button>
            <button
              onClick={downloadHtml}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-600/50 transition-colors border border-gray-600/50"
              title="Download HTML"
              disabled={isLoading}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Template Details */}
      <div className="template-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-lime-400" />
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="template-card bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4">Your Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-gray-700 rounded-lg shadow-md cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => !isLoading && loadTemplate(t)}
            >
              <h4 className="font-bold text-white">{t.title}</h4>
              <p className="text-sm text-gray-400">Score: {t.score}/100</p>
              <p className="text-xs text-gray-500">
                Created: {t.createdAt.toDate().toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor and Preview */}
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
              disabled={isLoading}
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
              disabled={isLoading}
            >
              <Type className="w-4 h-4" />
              HTML Editor
            </button>
          </div>

          <div className="p-6">
            {activeTab === "visual" && (
              <div className="space-y-4">
                <EmailEditor
                  ref={emailEditorRef}
                  options={{
                    appearance: { theme: "dark" },
                    projectId: Number(process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID),
                    tools: {
                      image: {
                        properties: {
                          src: {
                            value: {
                              url: "https://via.placeholder.com/600x200?text=Your+Image+Here",
                            },
                          },
                        },
                      },
                    },
                    mergeTags: {
                      first_name: { name: "First Name", value: "{{first_name}}" },
                      last_name: { name: "Last Name", value: "{{last_name}}" },
                      email: { name: "Email", value: "{{email}}" },
                    },
                  }}
                />
              </div>
            )}

            {activeTab === "html" && (
              <textarea
                value={template.htmlContent}
                onChange={(e) => setTemplate({ ...template, htmlContent: e.target.value })}
                className="w-full h-96 bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all resize-none font-mono text-sm placeholder-gray-400"
                placeholder="Enter your HTML code here..."
                disabled={isLoading}
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
                  disabled={isLoading}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === "tablet" ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                  disabled={isLoading}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === "mobile" ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                  disabled={isLoading}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div
            className={`p-6 overflow-auto ${
              previewDevice === "mobile"
                ? "max-w-[375px] mx-auto"
                : previewDevice === "tablet"
                ? "max-w-[768px] mx-auto"
                : "w-full"
            }`}
          >
            {currentHtml || template.htmlContent ? (
              <iframe
                srcDoc={activeTab === "html" ? template.htmlContent : currentHtml}
                className="w-full h-[600px] border-none rounded-lg"
                title="Email Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-[600px] text-gray-400">
                No preview available. Start designing or load a template.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTemplateModal && (
        <TemplateModal
          onClose={() => setShowTemplateModal(false)}
          onSave={saveDesign}
          templateName={template.name}
          isLoading={isLoading}
        />
      )}
      {showConvertModal && (
        <ConvertModal
          onClose={() => setShowConvertModal(false)}
          onConvert={(html) => {
            setTemplate({ ...template, htmlContent: html });
            setCurrentHtml(html);
            setShowConvertModal(false);
            toast.success("HTML imported successfully");
          }}
        />
      )}
      {showAnalyzer && (
        <TemplateAnalyzer
          html={currentHtml}
          onClose={() => setShowAnalyzer(false)}
          onApplyFix={applyFixedHtml}
          onScoreUpdate={setTemplateScore}
        />
      )}
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
};

export default CreateTemplate;