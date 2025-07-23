import React, { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface TemplateModalProps {
  onClose: () => void;
  onSave: (title: string, plaintext: string) => void;
  templateName: string;
  isLoading: boolean;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ onClose, onSave, templateName, isLoading }) => {
  const [title, setTitle] = useState<string>(templateName);
  const [plaintext, setPlaintext] = useState<string>("");

  return (
    <div className="fixed inset-0 z-30 bg-black/70 flex items-center justify-center">
      <div className="w-[390px] bg-gray-800 rounded-xl p-5 text-white">
        <div className="flex justify-between items-center">
          <Image src="/logo.png" alt="CogniMail Logo" height={35} width={35} />
          <h2 className="font-black">
            <span className="text-lime-400">Save</span> <span className="text-green-500"> Template</span>
          </h2>
        </div>
        <div className="my-4">
          <h2 className="font-black">
            <span className="text-lime-400">Template</span> <span className="text-green-500"> Title</span>
          </h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Template title..."
            className="w-full py-3 px-4 rounded-xl outline-none shadow-xl mt-2 bg-gray-700 text-white border border-gray-600"
            disabled={isLoading}
          />
        </div>
        <div className="my-4">
          <h2 className="font-black">
            <span className="text-lime-400">Plain</span> <span className="text-green-500"> Text</span>
          </h2>
          <span className="text-gray-400">optional</span>
          <textarea
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder="Plain text for users who disabled HTML..."
            className="w-full py-3 px-4 rounded-xl outline-none h-[150px] shadow-xl mt-2 bg-gray-700 text-white border border-gray-600"
            disabled={isLoading}
          />
        </div>
        <div className="my-4">
          <button
            onClick={() => onSave(title, plaintext)}
            className="w-[120px] rounded-xl py-2 bg-gradient-to-r from-lime-400 to-green-500 text-gray-900 font-black disabled:opacity-50"
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-700 mt-4 px-4 rounded-xl py-2 text-white font-black"
          disabled={isLoading}
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default TemplateModal;