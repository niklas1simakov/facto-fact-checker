import React from "react";
import { PiSealCheck } from "react-icons/pi";
import { IoWarningOutline } from "react-icons/io5";
import { AiOutlineClose } from "react-icons/ai";
import { Badge } from "./ui/badge";
import { GoStop } from "react-icons/go";

export interface FactCardProps {
  statement: string;
  probability: "high" | "low" | "uncertain";
  summary: string;
  sources: string[];
}

const probabilityStyles = {
  high: {
    bg: "bg-green-100",
    border: "border-green-200",
    text: "text-green-600",
    badge: "border-green-500 text-green-600",
    badgeBg: "bg-transparent",
    icon: <PiSealCheck className="text-green-500" size={28} />, // check badge
    label: "High probability of truth",
  },
  uncertain: {
    bg: "bg-orange-100",
    border: "border-orange-200",
    text: "text-orange-500",
    badge: "border-orange-500 text-orange-500",
    badgeBg: "bg-transparent",
    icon: <IoWarningOutline className="text-orange-400" size={28} />, // warning
    label: "Uncertain",
  },
  low: {
    bg: "bg-red-100",
    border: "border-red-200",
    text: "text-red-500",
    badge: "border-red-500 text-red-500",
    badgeBg: "bg-transparent",
    icon: <GoStop className="text-red-400" size={28} />, // x
    label: "Low probability of truth",
  },
};

const SourcesIcon = () => (
  <svg width="36" height="18" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle mr-1">
    <circle cx="10" cy="10" r="7" fill="#fff" stroke="#CFCFCF" strokeWidth="2" />
    <circle cx="20" cy="10" r="7" fill="#fff" stroke="#CFCFCF" strokeWidth="2" />
    <circle cx="30" cy="10" r="7" fill="#fff" stroke="#CFCFCF" strokeWidth="2" />
  </svg>
);

const FactCard: React.FC<FactCardProps> = ({ statement, probability, summary, sources }) => {
  const style = probabilityStyles[probability] || probabilityStyles.low;
  return (
    <div
      className={`w-full rounded-[24px] px-8 py-5 flex items-center ${style.bg} ${style.border} border flex-row justify-between shadow-sm`}
      style={{ minHeight: 90 }}
    >
      <div className="flex flex-row items-center gap-4 w-full">
        <div className="pt-1 flex items-center">{style.icon}</div>
        <div className="flex flex-col gap-1 w-full">
          <div className={`font-bold text-sm ${style.text}`}>{statement}</div>
          <div className={`text-sm font-normal ${style.text}`}>{summary}</div>
          <div className="flex items-center gap-1 mt-1">
            <SourcesIcon />
            <span className={`font-medium text-sm ${style.text}`}>{sources.length}+ Sources</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end h-full justify-center ml-4">
        <Badge variant={probability} className="px-4 py-1.5 w-[150px] text-center">
          {style.label}
        </Badge>
      </div>
    </div>
  );
};

export default FactCard; 