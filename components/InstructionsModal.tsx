// src/components/InstructionsModal.tsx
import React from "react";
import { X, CheckCircle, AlertCircle, Info, Zap } from "lucide-react";

interface InstructionsModalProps {
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] max-w-[500px]">
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 w-10 h-10 rounded-full flex items-center justify-center mr-3">
              <Info size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Instructions</h2>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle size={20} className="text-blue-600 mr-3" />
              <p className="text-gray-800 dark:text-white">Score above 90% is required to send emails.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle size={20} className="text-red-600 mr-3" />
              <p className="text-gray-800 dark:text-white">No gaming content is allowed.</p>
            </li>
            <li className="flex items-start">
              <Zap size={20} className="text-yellow-600 mr-3" />
              <p className="text-gray-800 dark:text-white">Changing mandatory data is prohibited.</p>
            </li>
            <li className="flex items-start">
              <Info size={20} className="text-green-600 mr-3" />
              <div>
                <p className="text-gray-800 dark:text-white">Follow best practices for email design.</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Use JPEG, PNG, or GIF for images.</p>
              </div>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Note: Templates with a score below 90% or unsupported image formats (e.g., AVIF) cannot be used to send emails.</p>
          </div>
        </div>
        <div className="px-6 py-5 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;