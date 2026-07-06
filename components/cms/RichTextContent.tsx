import {
  isRichTextHtml,
  splitPlainTextParagraphs,
  unwrapRichTextParagraph,
} from "@/lib/cms/rich-text";
import { cn } from "@/lib/utils";

type RichTextContentProps = {
  content: string;
  className?: string;
  /** Render inside headings or quotes without a block wrapper. */
  inline?: boolean;
  /** Split legacy plain text on blank lines into multiple paragraphs. */
  splitPlainParagraphs?: boolean;
  /** Use light/gold links on dark section backgrounds. */
  linkTone?: "default" | "light";
};

function richTextClassName(
  className?: string,
  linkTone: RichTextContentProps["linkTone"] = "default",
) {
  return cn(
    "rich-text-content",
    linkTone === "light" && "rich-text-content--links-light",
    className,
  );
}

export function RichTextContent({
  content,
  className,
  inline = false,
  splitPlainParagraphs = false,
  linkTone = "default",
}: RichTextContentProps) {
  if (!content.trim()) return null;

  if (inline) {
    if (!isRichTextHtml(content)) {
      return <span className={className}>{content}</span>;
    }

    return (
      <span
        className={richTextClassName(className, linkTone)}
        dangerouslySetInnerHTML={{ __html: unwrapRichTextParagraph(content) }}
      />
    );
  }

  if (splitPlainParagraphs && !isRichTextHtml(content)) {
    const paragraphs = splitPlainTextParagraphs(content);
    if (paragraphs.length <= 1) {
      return <p className={className}>{paragraphs[0] ?? content}</p>;
    }

    return (
      <div className={richTextClassName(className, linkTone)}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    );
  }

  if (!isRichTextHtml(content)) {
    return <p className={className}>{content}</p>;
  }

  return (
    <div
      className={richTextClassName(className, linkTone)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
