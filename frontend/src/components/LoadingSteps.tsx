import React, { useEffect, useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressStage } from "@/lib/useFactCheckWebSocket";

export interface LoadingStep {
  label: string;
  stage: ProgressStage;
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
  currentStage: ProgressStage;
  statementIndex?: number;
  totalStatements?: number;
}

const LoadingSteps: React.FC<LoadingStepsProps> = ({
  inputValue,
  currentStage,
  statementIndex,
  totalStatements,
}) => {
  // Local state to delay progression between steps
  const [displayedStep, setDisplayedStep] = useState(0);

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

  // Determine target step index based on currentStage
  let targetStep = 0;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].stage === currentStage) {
      targetStep = i;
      break;
    }
  }

  // Delay progression between steps to let animations run
  useEffect(() => {
    if (displayedStep < targetStep) {
      const timeout = setTimeout(
        () => setDisplayedStep(displayedStep + 1),
        800
      );
      return () => clearTimeout(timeout);
    } else if (displayedStep > targetStep) {
      setDisplayedStep(targetStep);
    }
  }, [displayedStep, targetStep, currentStage]);

  // Update the verification step label to show progress through statements
  if (
    currentStage === "verification" &&
    statementIndex !== undefined &&
    totalStatements
  ) {
    const verificationStepIndex = isUrl(inputValue) ? 4 : 3;
    steps[verificationStepIndex] = {
      label: `Verifying statements (${statementIndex + 1}/${totalStatements})`,
      stage: "verification",
    };
  }

  // Update extraction_complete to show total statements
  if (currentStage === "extraction_complete" && totalStatements) {
    const extractionCompleteIndex = isUrl(inputValue) ? 3 : 2;
    steps[extractionCompleteIndex] = {
      label: `Statements extraction complete (found ${totalStatements})`,
      stage: "extraction_complete",
    };
  }

  // Render only the steps; mounting and unmounting (and fade-out) controlled by parent
  return (
    <AnimatePresence>
      <motion.div
        key="loading-steps"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2 mt-2 ml-0 w-fit"
      >
        {steps.map((step, idx) => (
          <motion.div
            key={step.label + idx}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
          >
            {idx < displayedStep ? (
              <FaRegCheckCircle className="text-black" size={18} />
            ) : idx === displayedStep ? (
              <ImSpinner2 className="animate-spin text-black" size={18} />
            ) : (
              <span className="inline-block w-[18px] h-[18px] rounded-full border-2 border-gray-300" />
            )}
            <span
              className={`text-base font-medium ${
                idx <= displayedStep ? "text-black" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingSteps;
