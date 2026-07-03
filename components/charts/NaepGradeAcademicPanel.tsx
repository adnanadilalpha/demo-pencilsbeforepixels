import { ContentImage } from "@/components/ui/ContentImage";
import type { NaepYearZeroChart } from "@/lib/research/types";

type NaepGradeAcademicPanelProps = {
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
      className={
        tone === "pre"
          ? "rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-center sm:px-4 sm:py-3"
          : "rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-center sm:px-4 sm:py-3"
      }
    >
      <p className="text-[11px] leading-snug text-white/50 sm:text-xs">{label}</p>
      <p
        className={`mt-1 text-sm font-semibold sm:text-base ${
          tone === "pre" ? "text-white" : "text-red-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function NaepGradeAcademicPanel({
  heading,
  imageSrc,
  imageAlt,
  math,
  reading,
}: NaepGradeAcademicPanelProps) {
  const slopeCards = [
    { ...math.slopes.pre, tone: "pre" as const },
    { ...math.slopes.post, tone: "post" as const },
    { ...reading.slopes.pre, tone: "pre" as const },
    { ...reading.slopes.post, tone: "post" as const },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <p className="font-sans text-sm font-semibold text-white sm:text-base">
        {heading}
      </p>

      <div className="overflow-hidden rounded-xl border border-white/15 bg-white px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
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

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-4">
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
