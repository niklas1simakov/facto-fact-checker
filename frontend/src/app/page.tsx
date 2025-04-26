"use client";

import Image from "next/image";
import FactCard from "@/components/FactCard";
import InputBar from "@/components/InputBar";
import LiveStatusBar from "@/components/LiveStatusBar";
import LoadingSteps, { LoadingStep } from "@/components/LoadingSteps";
import React, { useState } from "react";
import { useFactCheckWebSocket } from "@/lib/useFactCheckWebSocket";

const stepsText: LoadingStep[] = [
  { label: "Extract your statement" },
  { label: "AI fact check all statements" },
];
const stepsUrl: LoadingStep[] = [
  { label: "Fetch video data" },
  { label: "Extract all statements" },
  { label: "AI fact check all statements" },
];

function isUrl(str: string) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const { progress, results, error, sendFactCheck } = useFactCheckWebSocket();
  const steps = isUrl(inputValue) ? stepsUrl : stepsText;

  // Handle input change and trigger fact check
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim()) {
      sendFactCheck(value);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start md:pt-[30vh] bg-[#fff] px-4 py-12">
      <div className="flex flex-col items-center mb-8 w-full max-w-4xl">
        <Image
          src="/assets/facto_v2.png"
          alt="Facto Logo"
          width={320}
          height={107}
          priority
          className="mb-4"
        />
        <p className="text-lg text-gray-500 mb-6 md:mb-12 text-center">
          Verify TikTok and Instagram Reel content authenticity
        </p>
        <LiveStatusBar />
        <div className="w-full flex flex-col items-start">
          <InputBar onInputChange={handleInputChange} />
          {progress && (
            <div className="w-full flex justify-center">
              <LoadingSteps
                steps={steps}
                currentStep={
                  progress.progress
                    ? Math.floor((progress.progress / 100) * steps.length)
                    : 0
                }
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        {error && <div className="text-red-500 text-center">{error}</div>}
        {progress && progress.message && (
          <div className="text-blue-500 text-center">{progress.message}</div>
        )}
        {results &&
          results.map((result, idx) => (
            <FactCard
              key={idx}
              statement={result.statement}
              probability={result.probability as "high" | "low" | "uncertain"}
              summary={result.reason}
              sources={result.sources}
            />
          ))}
      </div>
      <div className="mt-12 flex items-center">
        <span className="text-sm text-gray-500">Powered by</span>
        <Image
          src="/assets/OpenAI-black-wordmark.png"
          alt="OpenAI Logo"
          width={100}
          height={20}
          className="opacity-80 -ml-1"
        />
      </div>
    </div>
  );
}
