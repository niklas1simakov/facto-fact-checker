"use client";

import Image from "next/image";
import FactCard from "@/components/FactCard";
import InputBar from "@/components/InputBar";
import LiveStatusBar from "@/components/LiveStatusBar";
import LoadingSteps from "@/components/LoadingSteps";
import React, { useState } from "react";
import {
  useFactCheckWebSocket,
  FactCheckResult,
  ProgressStage,
} from "@/lib/useFactCheckWebSocket";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const {
    progress,
    results: rawResults,
    error,
    sendFactCheck,
  } = useFactCheckWebSocket();
  const results: FactCheckResult[] | null = rawResults as
    | FactCheckResult[]
    | null;
  const loading = !!progress && !results;

  // Handle input change and trigger fact check
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim() && !loading) {
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
        <p className="text-lg text-gray-500 mb-6 text-center">
          Verify TikTok and Instagram Reel content authenticity
        </p>
        <LiveStatusBar className="mb-6 md:mb-12" />
        <div className="w-full flex flex-col items-start">
          <InputBar onInputChange={handleInputChange} loading={loading} />
          {loading && (
            <div className="w-full flex justify-center">
              <LoadingSteps
                inputValue={inputValue}
                currentStage={(progress?.stage as ProgressStage) || "started"}
                statementIndex={progress?.statementIndex}
                totalStatements={progress?.totalStatements}
                showResults={!!results}
              >
                {/* Results area with smooth transition */}
                <div className="flex flex-col gap-6 w-full max-w-2xl">
                  {error && (
                    <div className="text-red-500 text-center">{error}</div>
                  )}
                  {Array.isArray(results) &&
                    (results as FactCheckResult[]).length === 0 && (
                      <div className="text-yellow-500 text-center">
                        No statements determined, please try again.
                      </div>
                    )}
                  {Array.isArray(results) &&
                    (results as FactCheckResult[]).length > 0 &&
                    (results as FactCheckResult[]).map(
                      (result: FactCheckResult, idx: number) => (
                        <FactCard
                          key={idx}
                          statement={result.statement}
                          probability={
                            result.probability as "high" | "low" | "uncertain"
                          }
                          summary={result.reason}
                          sources={result.sources}
                        />
                      )
                    )}
                </div>
              </LoadingSteps>
            </div>
          )}
        </div>
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
