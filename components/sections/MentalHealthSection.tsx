import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { TextLink } from "@/components/ui/TextLink";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getSiteContent } from "@/lib/cms/cached";

export async function MentalHealthSection() {
  const content = await getSiteContent();
  const section = content.sections["homepage.mental_health"] ?? {};
  const { mentalHealthPoints, mentalHealthLegend, media } = content;

  const label = (section.label as string) ?? "Behaviour & Mental Health";
  const headline = (section.headline as string) ?? label;
  const body =
    (section.body as string) ??
    "Researchers continue to study how increased screen exposure may influence attention, behaviour and emotional wellbeing.";
  const cta = (section.cta as { label: string; href: string }) ?? {
    label: "Explore Evidence",
    href: "/evidence",
  };

  return (
    <section className="w-full bg-[#0b1e2e] py-24 max-lg:py-16">
      <Container className="flex flex-col items-center gap-12 max-lg:gap-8">
        <ScrollReveal className="flex flex-col items-center gap-6 text-center max-lg:gap-6">
          <p className="text-base font-medium uppercase leading-none text-gold-accent max-lg:text-sm">
            {label}
          </p>
          <DisplayHeading as="h2" className="text-white">
            {headline}
          </DisplayHeading>
          <p className="max-w-[724px] text-base leading-[1.4] text-white/70 sm:text-lg">
            {body}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.12} offset={32} className="flex w-full flex-col gap-16 max-lg:gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {mentalHealthLegend.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span
                    className="h-0.5 w-6"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  <span className="text-[11px] leading-normal text-white/40">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative w-full overflow-hidden pt-5">
              <Image
                src={media.charts.mentalHealth}
                alt="Line chart showing rising mental health indicators from 2012 to 2018"
                width={2000}
                height={800}
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 md:gap-8">
            {mentalHealthPoints.map((point, index) => (
              <div
                key={point}
                className={`flex flex-col items-start gap-3 border-b border-white/6 pb-6 md:flex-row md:items-center md:gap-8 md:pb-1 ${
                  index === mentalHealthPoints.length - 1
                    ? "md:col-span-2 lg:col-span-1"
                    : ""
                }`}
              >
                <span className="font-sans text-3xl font-medium leading-none text-paper-300 md:text-4xl lg:text-[56px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-lg font-semibold leading-[1.4] text-white/82 md:flex-1 md:text-xl lg:text-[32px]">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="rounded-full bg-navy-50 px-6 py-3">
            <TextLink href={cta.href} variant="dark">
              {cta.label}
            </TextLink>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
