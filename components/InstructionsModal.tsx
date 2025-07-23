"use client";
import React, { useEffect, useRef } from "react";
import { X, CheckCircle, AlertCircle, Info, Zap } from "lucide-react";
import { gsap } from "gsap";

interface InstructionsModalProps {
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.from(".instruction-item", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.3,
      });
    }, modalRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div
        ref={modalRef}
        className="relative w-[90%] max-w-[520px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-lime-500/30 shadow-xl shadow-lime-500/10 p-6 font-mono"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-700/50 text-lime-500 hover:bg-lime-500/20 hover:text-lime-400 transition-all"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center">
            <Info size={20} className="text-gray-900" />
          </div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">
            Template Instructions
          </h2>
        </div>
        <ul className="space-y-5">
          <li className="instruction-item flex items-start gap-3">
            <CheckCircle size={20} className="text-lime-500 mt-1" />
            <p className="text-gray-200 text-sm">
              Score above <span className="font-bold text-lime-400">90%</span> required to send emails.
            </p>
          </li>
          <li className="instruction-item flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 mt-1" />
            <p className="text-gray-200 text-sm">
              No <span className="font-bold text-red-400">gaming content</span> allowed.
            </p>
          </li>
          <li className="instruction-item flex items-start gap-3">
            <Zap size={20} className="text-lime-500 mt-1" />
            <p className="text-gray-200 text-sm">
              Changing <span className="font-bold text-lime-400">mandatory data</span> prohibited.
            </p>
          </li>
          <li className="instruction-item flex items-start gap-3">
            <Info size={20} className="text-lime-500 mt-1" />
            <div>
              <p className="text-gray-200 text-sm">Follow email design best practices.</p>
              <p className="text-xs text-gray-400">
                Use <span className="font-semibold text-lime-400">JPEG, PNG, or GIF</span> for images.
              </p>
            </div>
          </li>
        </ul>
        <div className="mt-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
          <p className="text-red-400 text-xs">
            Note: Templates with a score below <span className="font-bold">90%</span> or unsupported image formats (e.g., AVIF) cannot be used.
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-lime-500 to-green-600 text-gray-900 font-bold rounded-xl hover:bg-gradient-to-r hover:from-lime-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;