import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { PiSealCheck } from "react-icons/pi";
import { IoWarningOutline } from "react-icons/io5";
import { Badge } from "./ui/badge";
import { GoStop } from "react-icons/go";
import { FiGlobe } from "react-icons/fi";
import { HiDotsCircleHorizontal } from "react-icons/hi";

export interface FactCardProps {
  statement: string;
  probability: "high" | "low" | "uncertain";
  summary: string;
  sources: string[];
}

// Function to extract domain from URL
const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch {
    // Return just the URL if it's not a valid URL
    return url;
  }
};

// Function to get favicon URL for a domain
const getFaviconUrl = (domain: string): string => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
};

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
  <svg
    width="36"
    height="18"
    viewBox="0 0 40 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-middle mr-1"
  >
    <circle
      cx="10"
      cy="10"
      r="7"
      fill="#fff"
      stroke="#CFCFCF"
      strokeWidth="2"
    />
    <circle
      cx="20"
      cy="10"
      r="7"
      fill="#fff"
      stroke="#CFCFCF"
      strokeWidth="2"
    />
    <circle
      cx="30"
      cy="10"
      r="7"
      fill="#fff"
      stroke="#CFCFCF"
      strokeWidth="2"
    />
  </svg>
);

const FactCard: React.FC<FactCardProps> = ({
  statement,
  probability,
  summary,
  sources,
}) => {
  const style = probabilityStyles[probability] || probabilityStyles.low;
  const [faviconUrls, setFaviconUrls] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [sourceUrls, setSourceUrls] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [showAllSources, setShowAllSources] = useState(false);
  const allSourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sources && sources.length > 0) {
      // Process up to 3 sources for the main display
      const topSources = sources.slice(0, 3);
      setSourceUrls(topSources);
      const extractedDomains = topSources.map(extractDomain);
      setDomains(extractedDomains);
      const favicons = extractedDomains.map(getFaviconUrl);
      setFaviconUrls(favicons);
      setImageErrors({});
    }
  }, [sources]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        allSourcesRef.current &&
        !allSourcesRef.current.contains(event.target as Node)
      ) {
        setShowAllSources(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const toggleAllSources = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAllSources(!showAllSources);
  };

  return (
    <div
      className={`w-full rounded-[24px] px-4 py-4 md:px-8 md:py-5 flex flex-col md:flex-row items-stretch md:items-center ${style.bg} ${style.border} border shadow-sm`}
      style={{ minHeight: 90 }}
    >
      <div className="flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-4 w-full order-1 md:order-1">
        <div className="pt-1 flex items-center justify-center md:justify-center shrink-0">
          {style.icon}
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className={`font-bold text-sm ${style.text}`}>{statement}</div>
          <div className={`text-sm font-normal ${style.text}`}>{summary}</div>
          <div className="flex items-center gap-1 mt-1 relative">
            {faviconUrls.length > 0 ? (
              <div className="flex -space-x-2 mr-1">
                {faviconUrls.map((url, index) => (
                  <a
                    key={index}
                    href={sourceUrls[index]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group relative"
                    title={domains[index]}
                  >
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                      Visit {domains[index]}
                    </span>
                    <div className="w-5 h-5 rounded-full border border-gray-200 bg-white flex items-center justify-center overflow-hidden relative hover:z-10 transition-all hover:scale-110 cursor-pointer">
                      {imageErrors[index] ? (
                        <FiGlobe size={12} className="text-gray-400" />
                      ) : (
                        <Image
                          src={url}
                          alt={domains[index]}
                          width={16}
                          height={16}
                          className="object-contain"
                          unoptimized
                          onError={() => handleImageError(index)}
                        />
                      )}
                    </div>
                  </a>
                ))}

                {sources.length > 3 && (
                  <div className="relative" ref={allSourcesRef}>
                    <div
                      className="w-5 h-5 rounded-full border border-gray-200 bg-white flex items-center justify-center relative hover:z-10 transition-all hover:scale-110 cursor-pointer group"
                      onClick={toggleAllSources}
                      title="View all sources"
                    >
                      <HiDotsCircleHorizontal
                        size={16}
                        className="text-gray-400"
                      />
                      <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                        {sources.length - 3}
                      </span>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                        {sources.length - 3} more{" "}
                        {sources.length - 3 === 1 ? "source" : "sources"}
                      </span>
                    </div>

                    {showAllSources && (
                      <div className="absolute top-7 left-0 md:left-0 right-0 md:right-auto bg-white rounded-lg shadow-md border border-gray-200 p-2 z-30 w-full md:w-64 max-h-60 md:max-h-80 overflow-y-auto">
                        <div className="flex justify-between items-center mb-2 px-2">
                          <h4 className="text-sm font-medium text-gray-700">
                            All Sources
                          </h4>
                          <button
                            onClick={toggleAllSources}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Close sources list"
                          >
                            ✕
                          </button>
                        </div>
                        <ul className="flex flex-col gap-1">
                          {sources.map((source, index) => {
                            const domain = extractDomain(source);
                            const faviconUrl = getFaviconUrl(domain);
                            return (
                              <li key={index}>
                                <a
                                  href={source}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm text-gray-600 transition-colors"
                                >
                                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                    <Image
                                      src={faviconUrl}
                                      alt={domain}
                                      width={16}
                                      height={16}
                                      className="object-contain"
                                      unoptimized
                                      onError={(e) => {
                                        const img =
                                          e.target as HTMLImageElement;
                                        img.style.display = "none";
                                      }}
                                    />
                                  </div>
                                  <span className="truncate">{domain}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <SourcesIcon />
            )}
            <span
              className={`font-medium text-sm ${style.text} ${
                sources.length > 3 ? "cursor-pointer hover:underline" : ""
              }`}
              onClick={sources.length > 3 ? toggleAllSources : undefined}
            >
              {sources.length}+ Sources
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end mt-3 md:mt-0 md:ml-4 order-2 md:order-2 w-full md:w-auto">
        <Badge
          variant={probability}
          className="px-4 py-1.5 w-full md:w-[150px] text-center"
        >
          {style.label}
        </Badge>
      </div>
    </div>
  );
};

export default FactCard;
