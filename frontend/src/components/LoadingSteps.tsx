import React from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

export interface LoadingStep {
  label: string;
}

interface LoadingStepsProps {
  steps: LoadingStep[];
  currentStep: number; // 0-based index of the currently loading step
}

const LoadingSteps: React.FC<LoadingStepsProps> = ({ steps, currentStep }) => {
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
          <span className={`text-base font-medium ${idx <= currentStep ? "text-black" : "text-gray-400"}`}>{step.label}</span>
        </div>
      ))}
    </div>
  );
};

export default LoadingSteps; 