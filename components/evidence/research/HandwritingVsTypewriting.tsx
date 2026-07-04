"use client";

import { useState } from "react";
import {
  Activity,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Eye,
  Hand,
  Layers,
  Link2,
  PenLine,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  researchBodyText,
  researchChartCaptionDark,
  researchChartCaptionMutedDark,
  researchSectionHeading,
} from "@/components/charts/chart-theme";
import { cn } from "@/lib/utils";

type Region = {
  code: string;
  region: string;
  role: string;
  icon: LucideIcon;
  detail: string;
};

const REGIONS: Region[] = [
  {
    code: "PL",
    region: "Parietal Left",
    role: "Language & Writing",
    icon: PenLine,
    detail:
      "This region processes written language — connecting letters, words, and meaning. It is active during reading, spelling, and comprehension. Handwriting keeps it highly engaged because each letter must be carefully formed.",
  },
  {
    code: "PM",
    region: "Parietal Midline",
    role: "Memory Formation",
    icon: BookOpen,
    detail:
      "Often called the brain\u2019s \"save button\" — this region encodes new information into long-term memory. When it is active and connected to other regions, what you learn is more likely to stick.",
  },
  {
    code: "PR",
    region: "Parietal Right",
    role: "Spatial Awareness",
    icon: Eye,
    detail:
      "Handles the visual and spatial processing needed to recognise the shape, size, and orientation of letters. This is what allows a child to tell the difference between \"b\" and \"d.\"",
  },
  {
    code: "CL",
    region: "Central Left",
    role: "Fine Motor Control",
    icon: Hand,
    detail:
      "Manages the precise, controlled movements of the hand and fingers during writing. Because every letter requires a unique movement pattern, this region stays continuously active during handwriting.",
  },
  {
    code: "CM",
    region: "Central Midline",
    role: "Attention & Focus",
    icon: Crosshair,
    detail:
      "Coordinates sustained attention — keeping the brain on task. Handwriting requires deliberate effort for each character, which maintains a higher level of focus compared to tapping a single key.",
  },
  {
    code: "CR",
    region: "Central Right",
    role: "Sensorimotor Integration",
    icon: Layers,
    detail:
      "Links visual input, motor commands, and physical feedback into one experience. When writing by hand, the eyes, hand, and brain form a continuous feedback loop that reinforces learning.",
  },
];

const STRONG_CONNECTIONS = [
  { a: "CR", b: "PM" },
  { a: "CL", b: "PM" },
  { a: "CM", b: "CR" },
];

const PARIETAL_HIGHLIGHT = ["PL", "PM", "PR"];

const WAVES = [
  {
    Icon: Activity,
    freq: "3.5 – 7.5 Hz",
    role: "Working Memory",
    wave: "Theta",
    detail:
      "These slow waves are the brain\u2019s way of holding new information in mind and processing it. When theta activity is high, the brain is actively absorbing and organising what it\u2019s encountering — which is exactly what good learning looks like.",
  },
  {
    Icon: TrendingUp,
    freq: "8 – 12.5 Hz",
    role: "Long-Term Memory",
    wave: "Alpha",
    detail:
      "Alpha waves are linked to consolidating information into lasting memory. When these connections are strong, what a student learns in class is far more likely to be retained the next day, week, and month.",
  },
];

export function HandwritingVsTypewriting() {
  const [idx, setIdx] = useState(0);
  const r = REGIONS[idx];
  const Icon = r.icon;
  const isParietalHighlight = PARIETAL_HIGHLIGHT.includes(r.code);
  const connections = STRONG_CONNECTIONS.filter(
    (c) => c.a === r.code || c.b === r.code,
  )
    .map((c) => REGIONS.find((reg) => reg.code === (c.a === r.code ? c.b : c.a)))
    .filter((reg): reg is Region => reg !== undefined);

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <div className="flex flex-col gap-4 border-b border-navy-800/8 pb-6 sm:flex-row sm:items-end sm:justify-between md:pb-8">
        <div className="flex flex-col gap-2">
          <p className={cn(researchChartCaptionDark, "text-gold-500")}>
            EEG Research · NTNU 2024
          </p>
          <h3 className={researchSectionHeading}>
            Handwriting <span className="font-normal text-navy-800/45">vs.</span>{" "}
            Typewriting
          </h3>
        </div>
        <p className={cn(researchBodyText, "max-w-md")}>
          A 256-sensor EEG study recorded brain activity in 36 university students
          as they wrote or typed the same words. The difference in how the brain
          engaged was immediate and significant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-navy-800 px-6 py-6">
          <svg
            viewBox="0 0 300 60"
            className="absolute inset-x-0 bottom-0 h-16 w-full opacity-70"
            aria-hidden
          >
            <path
              d="M0,30 Q10,8 20,32 T40,28 Q50,4 60,34 T80,30 Q90,10 100,32 T120,26 Q130,6 140,34 T160,30 Q170,12 180,30 T200,28 Q210,6 220,34 T240,30 Q250,10 260,32 T280,28 Q290,14 300,30"
              fill="none"
              stroke="#8aafd4"
              strokeWidth="2"
            />
          </svg>
          <p className={cn(researchChartCaptionMutedDark, "mb-3 text-white/50")}>
            During handwriting
          </p>
          <p className="font-display text-5xl font-semibold leading-none text-white">
            16
          </p>
          <p className="mt-2 text-lg italic leading-snug text-white/75">
            significant brain connections
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-navy-800/10 bg-navy-50 px-6 py-6">
          <svg
            viewBox="0 0 300 60"
            className="absolute inset-x-0 bottom-0 h-16 w-full opacity-70"
            aria-hidden
          >
            <line
              x1="0"
              y1="30"
              x2="300"
              y2="30"
              stroke="#d1d5db"
              strokeWidth="2"
              strokeDasharray="1 6"
              strokeLinecap="round"
            />
          </svg>
          <p className={cn(researchChartCaptionMutedDark, "mb-3")}>
            During typewriting
          </p>
          <p className="font-display text-5xl font-semibold leading-none text-navy-800">
            0
          </p>
          <p className="mt-2 font-mono text-sm uppercase tracking-wide text-navy-800/50">
            significant brain connections
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-navy-50 bg-navy-50 px-5 py-3">
          <span className={cn(researchBodyText, "text-sm")}>
            Significant clusters found across brain regions
          </span>
          <span className="ml-3 shrink-0 font-display text-xl font-semibold text-navy-800">
            32
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-navy-50 bg-navy-50 px-5 py-3">
          <span className={cn(researchBodyText, "text-sm")}>
            University students studied with 256-sensor EEG
          </span>
          <span className="ml-3 shrink-0 font-display text-xl font-semibold text-navy-800">
            36
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-navy-800/8" />
        <p className={researchChartCaptionMutedDark}>Six brain regions</p>
        <div className="h-px flex-1 bg-navy-800/8" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy-800/8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center justify-center gap-3 bg-navy-800 p-6">
            <p className={cn(researchChartCaptionMutedDark, "mb-1 text-white/50")}>
              Parietal
            </p>
            <div className="flex gap-2">
              {REGIONS.slice(0, 3).map((reg, i) => (
                <button
                  key={reg.code}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={cn(
                    "flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-all",
                    idx === i
                      ? "scale-110 border-[#4a6fa5] bg-[#4a6fa5] text-white"
                      : "border-white/25 bg-transparent text-[#8aafd4] hover:border-white/50",
                  )}
                >
                  {reg.code}
                </button>
              ))}
            </div>
            <div className="my-1 h-4 w-px bg-white/15" />
            <div className="flex gap-2">
              {REGIONS.slice(3, 6).map((reg, i) => (
                <button
                  key={reg.code}
                  type="button"
                  onClick={() => setIdx(i + 3)}
                  className={cn(
                    "flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-all",
                    idx === i + 3
                      ? "scale-110 border-[#4a6fa5] bg-[#4a6fa5] text-white"
                      : "border-white/25 bg-transparent text-[#8aafd4] hover:border-white/50",
                  )}
                >
                  {reg.code}
                </button>
              ))}
            </div>
            <p className={cn(researchChartCaptionMutedDark, "mt-1 text-white/50")}>
              Central
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/20 text-white transition-all hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIdx((i) => Math.min(REGIONS.length - 1, i + 1))}
                disabled={idx === REGIONS.length - 1}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/20 text-white transition-all hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50">
                <Icon size={18} className="text-navy-800" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold leading-tight text-navy-800">
                  {r.region}
                </p>
                <p className={researchChartCaptionMutedDark}>
                  {r.code} · {r.role}
                </p>
              </div>
            </div>

            <p className={cn(researchBodyText, "mb-5")}>{r.detail}</p>

            <div className="border-t border-navy-800/8 pt-5">
              <p className={cn(researchChartCaptionMutedDark, "mb-3")}>
                What the study found here
              </p>

              {isParietalHighlight ? (
                <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-navy-50 bg-navy-50 px-4 py-3">
                  <TrendingUp size={14} className="shrink-0 text-navy-800" />
                  <p className="text-xs font-medium leading-relaxed text-navy-800 md:text-sm">
                    Was significantly more engaged during handwriting than
                    typewriting.
                  </p>
                </div>
              ) : null}

              {connections.length > 0 ? (
                <div className="rounded-xl border border-navy-800/8 bg-paper-50 px-4 py-3">
                  <p className="mb-2 text-xs text-navy-800/60">
                    Showed strong syncing with:
                  </p>
                  <div className="flex flex-col gap-2">
                    {connections.map((other) => (
                      <div key={other.code} className="flex items-center gap-2">
                        <Link2 size={12} className="shrink-0 text-[#4a6fa5]" />
                        <span className="text-xs text-navy-800 md:text-sm">
                          <span className="font-semibold">{other.region}</span>
                          <span className="text-navy-800/50">
                            {" "}
                            — {other.role}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-navy-800/8" />
          <p className={researchChartCaptionMutedDark}>
            What the brain activity means
          </p>
          <div className="h-px flex-1 bg-navy-800/8" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {WAVES.map(({ Icon: WaveIcon, freq, role, wave, detail }) => (
            <div
              key={wave}
              className="rounded-xl border border-navy-800/8 bg-white p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50">
                  <WaveIcon size={16} className="text-navy-800" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-800">
                    {wave} waves · {role}
                  </p>
                  <p className={researchChartCaptionMutedDark}>{freq}</p>
                </div>
              </div>
              <p className={cn(researchBodyText, "mb-3 text-sm")}>{detail}</p>
              <div className="rounded-lg border border-navy-50 bg-navy-50 px-3 py-2 text-xs font-medium text-navy-800">
                Activated only during handwriting — not typewriting.
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-l-4 border-[#4a6fa5] bg-navy-800 px-6 py-5">
        <p className="font-display text-base leading-relaxed text-white md:text-lg">
          Handwriting activates far more of the brain than typing — specifically
          the regions and wave patterns linked to memory, attention, and learning.
          The careful, deliberate act of forming each letter by hand creates a
          rich network of brain connections that a key press simply cannot
          replicate.
        </p>
      </div>

      <p className={cn(researchChartCaptionMutedDark, "border-t border-navy-800/8 pt-4 leading-relaxed")}>
        Source: Van der Weel F.R. and Van der Meer A.L.H. (2024). &quot;Handwriting
        but not typewriting leads to widespread brain connectivity: a
        high-density EEG study with implications for the classroom.&quot; Frontiers
        in Psychology, 14:1219945. doi: 10.3389/fpsyg.2023.1219945.
      </p>
    </div>
  );
}
