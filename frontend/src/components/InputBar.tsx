"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InputBarProps {
  onInputChange?: (value: string) => void;
  loading?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({
  onInputChange,
  loading = false,
}) => {
  const [value, setValue] = useState("");

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && onInputChange) {
      onInputChange(value);
    }
  };

  return (
    <form
      className="flex flex-col sm:flex-row w-full max-w-4xl gap-2 mb-6 sm:gap-2"
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste Your Statement or TikTok/ Instagram Reel URL"
        className="w-full h-12 text-base"
        disabled={loading}
      />
      <Button
        type="submit"
        className="w-full sm:w-auto h-12 px-6 text-base font-semibold bg-[#007AFF] hover:bg-[#007AFF]/90 text-white"
        disabled={loading || !value.trim()}
      >
        {loading ? "Checking..." : "Check"}
      </Button>
    </form>
  );
};

export default InputBar;
