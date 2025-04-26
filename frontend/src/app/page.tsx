import Image from "next/image";
import FactCard, { FactCardProps } from "@/components/FactCard";
import InputBar from "@/components/InputBar";

const mockResults: FactCardProps[] = [
  {
    statement: "The Eiffel Tower is the tallest structure in Paris.",
    probability: "uncertain",
    summary: "The Eiffel Tower is not the tallest structure in Paris; the Tour Montparnasse is taller.",
    sources: [
      "https://www.example.com/eiffel-tower-height",
      "https://www.example.com/paris-landmarks",
    ],
  },
  {
    statement: "Honey never spoils.",
    probability: "high",
    summary: "Honey can last indefinitely due to its low moisture content and acidic pH.",
    sources: [
      "https://www.example.com/honey-shelf-life",
      "https://www.example.com/honey-facts",
    ],
  },
  {
    statement: "Bananas grow on trees.",
    probability: "low",
    summary: "Bananas grow on large herbaceous plants, not trees.",
    sources: [
      "https://www.example.com/banana-plant",
      "https://www.example.com/banana-tree-myth",
    ],
  },
  {
    statement: "Water boils at 90°C at sea level.",
    probability: "low",
    summary: "Water boils at 100°C at sea level.",
    sources: [
      "https://www.example.com/boiling-point-water",
      "https://www.example.com/sea-level-boiling-point",
    ],
  },
  {
    statement: "Humans swallow an average of eight spiders a year while sleeping.",
    probability: "low",
    summary: "This claim is a common urban legend and is not supported by evidence.",
    sources: [
      "https://www.example.com/spider-swallowing-myth",
      "https://www.example.com/urban-legends-about-spiders",
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-[30vh] bg-[#fff] px-4 py-12">
      <div className="flex flex-col items-center mb-8 w-full max-w-4xl">
        <Image
          src="/assets/facto_v2.png"
          alt="Facto Logo"
          width={320}
          height={107}
          priority
          className="mb-4"
        />
        <p className="text-lg text-gray-500 mb-12 text-center">Verify TikTok and Instagram Reel content authenticity</p>
        <InputBar />
      </div>
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        {mockResults.map((result, idx) => (
          <FactCard key={idx} {...result} />
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
