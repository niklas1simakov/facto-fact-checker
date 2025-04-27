import React from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { motion, AnimatePresence } from "framer-motion";

export interface LoadingStep {
  label: string;
  stage: string;
}

export function isUrl(str: string) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface LoadingStepsProps {
  inputValue: string;
  currentStage: string;
  currentStatement?: string;
  progressMessage?: string;
  showResults?: boolean;
  children?: React.ReactNode; // For results
}

const LoadingSteps: React.FC<LoadingStepsProps> = ({
  inputValue,
  currentStage,
  currentStatement,
  progressMessage,
  showResults,
  children,
}) => {
  let steps: LoadingStep[] = [];

  if (isUrl(inputValue)) {
    steps = [
      { label: "Starting fact check process", stage: "started" },
      { label: "Transcripting video", stage: "video-processing" },
      { label: "Extracting statements from transcript", stage: "extraction" },
      { label: "Statements extraction complete", stage: "extraction_complete" },
      { label: "Verifying statements", stage: "verification" },
    ];
  } else {
    steps = [
      { label: "Starting fact check process", stage: "started" },
      { label: "Extracting statements from text", stage: "extraction" },
      { label: "Statements extraction complete", stage: "extraction_complete" },
      { label: "Verifying statements", stage: "verification" },
    ];
  }

  // Find the current step index
  let currentStep = 0;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].stage === currentStage) {
      currentStep = i;
      break;
    }
  }

  if (currentStage === "extraction") {
    steps[isUrl(inputValue) ? 2 : 1] = {
      label: `Extracting statements from text - ${progressMessage}`,
      stage: "extraction",
    };
  }

  if (currentStage === "extraction_complete") {
    steps[isUrl(inputValue) ? 2 : 1] = {
      label: `Extracting statements from text`,
      stage: "extraction",
    };
    steps[isUrl(inputValue) ? 3 : 2] = {
      label: `Statements extraction complete - ${progressMessage}`,
      stage: "extraction_complete",
    };
  }

  return (
    <div className="flex flex-col gap-2 mt-2 ml-0 w-fit">
      <AnimatePresence>
        {steps.map((step, idx) => (
          <motion.div
            key={step.label + idx}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
          >
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
          </motion.div>
        ))}
      </AnimatePresence>
      {/* Smooth transition to results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingSteps;
