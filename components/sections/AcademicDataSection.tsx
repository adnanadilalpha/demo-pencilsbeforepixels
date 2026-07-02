import { Container } from "@/components/ui/Container";
import { getAcademicDatasets } from "@/lib/academic-data/fetch";
import { AcademicDataIntro } from "./AcademicDataIntro";
import { AcademicDataPanel } from "./AcademicDataPanel";

export async function AcademicDataSection() {
  const datasets = await getAcademicDatasets();

  return (
    <section className="w-full bg-navy-800 py-16 sm:py-24">
      <Container className="flex flex-col gap-8 sm:gap-12">
        <AcademicDataIntro />

        <AcademicDataPanel datasets={datasets} />
      </Container>
    </section>
  );
}
