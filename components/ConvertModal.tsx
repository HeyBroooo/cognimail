// src/components/ConvertModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface ConvertModalProps {
  onClose: () => void;
  onConvert: (json: any) => void;
}

const ConvertModal: React.FC<ConvertModalProps> = ({ onClose, onConvert }) => {
  const [htmlInput, setHtmlInput] = useState<string>("");
  const [convertedJson, setConvertedJson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const convertHtmlToJson = async () => {
    if (!htmlInput.trim()) {
      toast.error("Please provide HTML content to convert");
      return;
    }

    setIsLoading(true);
    try {
      const response = await (window as any).puter.ai.chat(
        `Convert this HTML email template to Unlayer JSON format. Follow these rules:
- Structure: { "body": { "rows": [] }, "counters": {} }
- Each row has "cells" (array of numbers) and "columns" (array of objects)
- Columns have "contents" with "type" (image/text/button) and "values"
- Professional styling:
  - Max-width: 600px
  - Padding: 10px for elements, 20px between sections
  - Font: Arial, 16px default
  - Responsive layout
  - Footer with "Powered by CogniMail" and "Unsubscribe: https://cognimail.vercel.app/"
  - Images must be in JPEG, PNG, or GIF format (no AVIF or WebP)
- Include counters for rows, columns, and content types
- Output clean JSON with 2-space indentation

HTML:
${htmlInput}

Return only the JSON output, no explanations.`
      );

      const jsonResult = JSON.parse(response);
      if (!validateUnlayerJson(jsonResult)) {
        throw new Error("Generated JSON does not meet Unlayer requirements");
      }

      const enhancedJson = {
        ...jsonResult,
        body: {
          ...jsonResult.body,
          values: {
            backgroundColor: "#ffffff",
            contentWidth: "600px",
            fontFamily: "Arial, Helvetica, sans-serif",
            preheaderText: "",
            ...jsonResult.body.values,
          },
          rows: [
            ...jsonResult.body.rows,
            {
              cells: [1],
              columns: [
                {
                  contents: [
                    {
                      type: "text",
                      values: {
                        text: `<div style="text-align: center; font-size: 12px; color: #666666;">
  <img src="https://safeburst.email/_next/image?url=%2Fimages%2Flogo.png&w=96&q=75" alt="SafeBurst Logo" style="max-width: 48px; vertical-align: middle; margin-right: 10px;">
  Powered by SafeBurst | <a href="https://safeburst.email/" style="color: #666666; text-decoration: underline;">Unsubscribe</a>
</div>`,
                        lineHeight: "1.5",
                        fontSize: "12px",
                        color: "#666666",
                        padding: "10px",
                        textAlign: "center",
                      },
                    },
                  ],
                  values: {
                    padding: "10px",
                    backgroundColor: "transparent",
                  },
                },
              ],
              values: {
                padding: "20px",
                backgroundColor: "#f5f5f5",
              },
            },
          ],
        },
        counters: {
          u_row: jsonResult.body.rows.length + 1,
          u_column:
            jsonResult.body.rows.reduce(
              (acc: number, row: any) => acc + row.columns.length,
              0
            ) + 1,
          u_content_text:
            jsonResult.body.rows
              .flatMap((row: any) =>
                row.columns.flatMap((col: any) => col.contents)
              )
              .filter((c: any) => c.type === "text").length + 1,
          u_content_image: jsonResult.body.rows
            .flatMap((row: any) =>
              row.columns.flatMap((col: any) => col.contents)
            )
            .filter((c: any) => c.type === "image").length,
          u_content_button: jsonResult.body.rows
            .flatMap((row: any) =>
              row.columns.flatMap((col: any) => col.contents)
            )
            .filter((c: any) => c.type === "button").length,
          ...jsonResult.counters,
        },
      };

      setConvertedJson(enhancedJson);
      toast.success("Email template converted successfully");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert HTML to JSON.");
      setConvertedJson(null);
    } finally {
      setIsLoading(false);
    }
  };

  const validateUnlayerJson = (json: any): boolean => {
    try {
      if (!json?.body?.rows || !Array.isArray(json.body.rows)) return false;
      for (const row of json.body.rows) {
        if (!row.cells || !Array.isArray(row.cells)) return false;
        if (!row.columns || !Array.isArray(row.columns)) return false;
        for (const column of row.columns) {
          if (!column.contents || !Array.isArray(column.contents)) return false;
          for (const content of column.contents) {
            if (!content.type || !content.values) return false;
            if (content.type === "image") {
              const src = content.values.src?.url || content.values.src;
              if (src && !isSupportedImageFormat(src)) {
                toast.error(`Unsupported image format in template: ${src}`);
                return false;
              }
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const isSupportedImageFormat = (url: string): boolean => {
    const extension = url.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif"].includes(extension || "");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl w-[90%] max-w-[1000px]">
        <div className="relative px-8 pt-8 pb-6 border-b border-gray-300 dark:border-gray-700 bg-gradient-to-r from-cyan-500 to-blue-500">
          <h2 className="text-3xl font-extrabold text-white">Convert HTML to JSON</h2>
          <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 py-8 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">HTML Input</h3>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste your HTML email template here..."
              className="w-full h-[300px] p-4 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600"
            />
            <button
              onClick={convertHtmlToJson}
              disabled={isLoading}
              className={`mt-4 w-full py-3 rounded-xl text-white font-bold ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-blue-500"
              }`}
            >
              {isLoading ? "Converting..." : "Convert to JSON"}
            </button>
          </div>
          <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Converted JSON</h3>
            <textarea
              value={convertedJson ? JSON.stringify(convertedJson, null, 2) : ""}
              readOnly
              placeholder="Converted JSON will appear here..."
              className="w-full h-[300px] p-4 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600"
            />
            <button
              onClick={() => {
                onConvert(convertedJson);
                onClose();
              }}
              disabled={!convertedJson}
              className={`mt-4 w-full py-3 rounded-xl text-white font-bold ${
                convertedJson ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvertModal;