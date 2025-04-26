"use client";

import React from "react";

const LiveStatusBar: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full mt-0.5 mb-6">
      <div className="flex items-center px-3 py-1 rounded-full border border-red-400 bg-red-50 text-red-500 text-xs font-medium shadow-sm animate-fade-in transition-all duration-300"
        style={{ maxWidth: '100vw' }}
      >
        <span className="flex items-center justify-center mr-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-blink" />
        </span>
        <span className="text-xs sm:text-sm font-medium">Hacking in Progress — Makeathon 2025</span>
      </div>
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .animate-blink {
          animation: blink 1.2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LiveStatusBar; 