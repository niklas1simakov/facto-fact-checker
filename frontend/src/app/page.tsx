"use client";

import Image from "next/image";
import FactCard from "@/components/FactCard";
import InputBar from "@/components/InputBar";
import LiveStatusBar from "@/components/LiveStatusBar";
import LoadingSteps from "@/components/LoadingSteps";
import React, { useState, useEffect } from "react";
import {
  useFactCheckWebSocket,
  FactCheckResult,
  ProgressStage,
} from "@/lib/useFactCheckWebSocket";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const {
    connected,
    progress,
    results: rawResults,
    error,
    sendFactCheck,
  } = useFactCheckWebSocket();
  const results = rawResults as FactCheckResult[] | null;

  // Queue send until WebSocket is connected
  useEffect(() => {
    if (isChecking && connected && !hasSent) {
      sendFactCheck(inputValue);
      setHasSent(true);
    }
  }, [isChecking, connected, hasSent, inputValue, sendFactCheck]);

  // Reset checking state when results or error arrive
  useEffect(() => {
    if (results || error) {
      setIsChecking(false);
    }
  }, [results, error]);

  // Handle input change and trigger fact check
  const handleInputChange = (value: string) => {
    if (!value.trim()) {
      return;
    }

    setInputValue(value);
    setIsChecking(true);
    setHasSent(false); // Reset send flag for new request

    // If already connected, send immediately and mark as sent
    if (connected) {
      sendFactCheck(value);
      setHasSent(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start md:pt-[30vh] bg-[#fff] px-4 py-12">
      <div className="flex flex-col items-center mb-8 w-full max-w-4xl">
        <Image
          src="/assets/facto_v2.png"
          alt="Facto Logo"
          width={320}
          height={95}
          priority
          className="mb-4"
        />
        <p className="text-lg text-gray-500 mb-6 text-center">
          Verify TikTok and Instagram Reel content authenticity
        </p>
        <LiveStatusBar className="mb-6 md:mb-12" />
        <div className="w-full flex flex-col items-start">
          <InputBar onInputChange={handleInputChange} loading={isChecking} />

          {hasSent && !connected && (
            <div className="w-full mt-4 text-red-500 text-center">
              WebSocket connection error. Please try again in a moment & check
              your internet connection.
            </div>
          )}

          <AnimatePresence mode="wait">
            {isChecking && !results && !error && (
              <motion.div
                key="loading"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-center"
              >
                <LoadingSteps
                  inputValue={inputValue}
                  currentStage={(progress?.stage as ProgressStage) || "started"}
                  statementIndex={progress?.statementIndex}
                  totalStatements={progress?.totalStatements}
                />
              </motion.div>
            )}
            {(results || error) && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-center"
              >
                <div className="flex flex-col gap-6 w-full max-w-2xl">
                  {error && (
                    <div className="text-red-500 text-center">{error}</div>
                  )}
                  {results && results.length === 0 && (
                    <div className="text-yellow-500 text-center">
                      No statements determined, please try again.
                    </div>
                  )}
                  {results &&
                    results.length > 0 &&
                    results.map((result, idx) => (
                      <FactCard
                        key={idx}
                        statement={result.statement}
                        probability={
                          result.probability as "high" | "low" | "uncertain"
                        }
                        summary={result.reason}
                        sources={result.sources}
                      />
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center mt-auto pt-6">
        <span className="text-sm text-gray-500 pt-0.5">Powered by</span>
        <Image
          src="/assets/OpenAI-black-wordmark.png"
          alt="OpenAI Logo"
          width={100}
          height={45}
          className="opacity-80 -ml-2"
        />
      </div>
    </div>
  );
}
