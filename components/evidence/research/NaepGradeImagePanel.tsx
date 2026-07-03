import { ContentImage } from "@/components/ui/ContentImage";
import {
  researchChartCaptionDark,
  researchChartCaptionMutedDark,
} from "@/components/charts/chart-theme";
import type { NaepYearZeroChart } from "@/lib/research/types";

type NaepGradeImagePanelProps = {
  heading: string;
  imageSrc: string;
  imageAlt: string;
  math: NaepYearZeroChart;
  reading: NaepYearZeroChart;
};

function SlopeCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "pre" | "post";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 text-center md:px-4 md:py-3 lg:px-6 ${
        tone === "pre"
          ? "border-navy-50 bg-navy-50"
          : "border-red-100 bg-red-50"
      }`}
    >
      <p className={researchChartCaptionMutedDark}>{label}</p>
      <p
        className={`mt-1 text-sm font-semibold md:text-base lg:text-lg ${
          tone === "pre" ? "text-navy-800" : "text-red-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function NaepGradeImagePanel({
  heading,
  imageSrc,
  imageAlt,
  math,
  reading,
}: NaepGradeImagePanelProps) {
  const slopeCards = [
    { ...math.slopes.pre, tone: "pre" as const },
    { ...math.slopes.post, tone: "post" as const },
    { ...reading.slopes.pre, tone: "pre" as const },
    { ...reading.slopes.post, tone: "post" as const },
  ];

  return (
    <div className="rounded-xl border border-navy-800/8 bg-white p-4 md:p-6 lg:p-10">
      <p className={`mb-4 md:mb-6 lg:mb-8 ${researchChartCaptionDark}`}>{heading}</p>

      <div className="overflow-hidden rounded-xl border border-navy-800/10 bg-slate-50/50">
        <ContentImage
          src={imageSrc}
          alt={imageAlt}
          width={1200}
          height={750}
          className="h-auto w-full object-contain"
          sizes="(max-width: 1024px) 100vw, 960px"
          priority={imageSrc.includes("gradeFour")}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 md:mt-6 md:gap-3 lg:mt-8 lg:grid-cols-4 lg:gap-5">
        {slopeCards.map((card) => (
          <SlopeCard
            key={card.label}
            label={card.label}
            value={card.value}
            tone={card.tone}
          />
        ))}
      </div>
    </div>
  );
}
