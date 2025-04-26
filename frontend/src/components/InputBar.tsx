"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const InputBar: React.FC = () => {
  const [value, setValue] = useState("");
  return (
    <form className="flex w-full max-w-4xl gap-2">
      <Input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Paste Your Statement or TikTok/ Instagram URL"
        className="flex-1 h-12 text-base"
      />
      <Button
        type="submit"
        className="h-12 px-6 text-base font-semibold bg-[#007AFF] hover:bg-[#007AFF]/90 text-white"
      >
        Check
      </Button>
    </form>
  );
};

export default InputBar; 