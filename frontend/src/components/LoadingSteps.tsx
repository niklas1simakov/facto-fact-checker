import React from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import type { FactCheckProgress } from "@/lib/useFactCheckWebSocket";

export interface LoadingStep {
  label: string;
}

interface LoadingStepsProps {
  mode: "url" | "text";
  progress: FactCheckProgress | null;
  numStatements: number;
}

const LoadingSteps: React.FC<LoadingStepsProps> = ({
  mode,
  progress,
  numStatements,
}) => {
  // Step generation logic
  let steps: LoadingStep[] = [];
  if (mode === "url") {
    steps = [
      { label: "Fetch video data" },
      { label: "Extract all statements" },
    ];
    for (let i = 0; i < numStatements; i++) {
      steps.push({
        label: `Fact check statement ${i + 1} of ${numStatements}`,
      });
    }
  } else {
    steps = [
      { label: "Extract your statement" },
      { label: "AI fact check all statements" },
    ];
    if (numStatements > 1) {
      for (let i = 0; i < numStatements; i++) {
        steps.push({
          label: `Fact check statement ${i + 1} of ${numStatements}`,
        });
      }
    }
  }

  // Determine current step
  let currentStep = 0;
  if (progress) {
    if (progress.stage === "fetch_video") currentStep = 0;
    else if (progress.stage === "extract_statements") currentStep = 1;
    else if (progress.stage === "fact_check" && progress.current_statement) {
      // Find which statement is being checked
      const idx = progress.statements?.findIndex(
        (s: string) => s === progress.current_statement
      );
      if (idx !== undefined && idx >= 0) {
        currentStep = (mode === "url" ? 2 : steps.length - numStatements) + idx;
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-2 ml-0 w-fit">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex items-center gap-2">
          {idx < currentStep ? (
            <FaRegCheckCircle className="text-black" size={18} />
          ) : idx === currentStep ? (
            <ImSpinner2 className="animate-spin text-black" size={18} />
          ) : (
            <span className="inline-block w-[18px] h-[18px] rounded-full border-2 border-gray-300" />
          )}
          <span
            className={`text-base font-medium ${
              idx <= currentStep ? "text-black" : "text-gray-400"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LoadingSteps;
