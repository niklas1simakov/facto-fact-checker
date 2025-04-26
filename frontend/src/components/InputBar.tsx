"use client";

import React, { useState } from "react";

const InputBar: React.FC = () => {
  const [value, setValue] = useState("");
  return (
    <form className="flex w-full max-w-xl gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Paste Your Statement or TikTok/ Instagram URL"
        className="flex-1 px-4 h-12 py-2 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base bg-white"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 h-12 rounded-lg transition-colors shadow-sm text-base"
      >
        Check
      </button>
    </form>
  );
};

export default InputBar; 