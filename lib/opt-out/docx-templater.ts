import "server-only";

import Docxtemplater from "docxtemplater";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error no bundled types
import ImageModule from "docxtemplater-image-module-free";
import PizZip from "pizzip";

type TemplateImage = {
  tag: string;
  data: Buffer;
  width?: number;
  height?: number;
};

function prepareImageTag(zip: PizZip, tag: string) {
  const documentPath = "word/document.xml";
  const documentXml = zip.file(documentPath)?.asText();
  if (!documentXml) return;

  zip.file(
    documentPath,
    documentXml.replaceAll(`{${tag}}`, `{%${tag}}`),
  );
}

export function renderDocxTemplate(
  templateBuffer: Buffer,
  data: Record<string, string>,
  image?: TemplateImage,
): Buffer {
  const zip = new PizZip(templateBuffer);

  if (image) {
    prepareImageTag(zip, image.tag);
  }

  const modules = image
    ? [
        new ImageModule({
          centered: false,
          getImage(_tagValue: string, tagName: string) {
            if (tagName !== image.tag) {
              return Buffer.alloc(0);
            }

            return image.data;
          },
          getSize(_img: Buffer, _tagValue: string, tagName: string) {
            if (tagName !== image.tag) {
              return [100, 40] as [number, number];
            }

            return [image.width ?? 180, image.height ?? 55] as [number, number];
          },
        }),
      ]
    : [];

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules,
    nullGetter: () => "",
  });

  const renderData: Record<string, string> = { ...data };

  if (image) {
    renderData[image.tag] = image.data.toString("base64");
  }

  try {
    doc.render(renderData);
  } catch (error) {
    const message =
      error instanceof Error && "properties" in error
        ? JSON.stringify((error as Error & { properties?: unknown }).properties)
        : error instanceof Error
          ? error.message
          : "Unknown template error";

    throw new Error(`DOCX template render failed: ${message}`);
  }

  return Buffer.from(doc.getZip().generate({ type: "nodebuffer" }));
}
