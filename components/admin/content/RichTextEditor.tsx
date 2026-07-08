"use client";

import { adminLabelClass } from "@/components/admin/admin-styles";
import { normalizeRichTextOutput } from "@/lib/cms/rich-text";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link2, Redo2, Undo2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";

type RichTextEditorProps = {
  label: string;
  value: string;
  placeholder?: string;
  /** Shorter editor for headlines, titles, and single-line copy. */
  compact?: boolean;
  onChange: (value: string) => void;
};

function ToolbarButton({
  active,
  disabled = false,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-w-8 rounded-md px-2 py-1 text-sm font-semibold transition-colors",
        disabled
          ? "cursor-not-allowed text-navy-800/30"
          : active
            ? "bg-navy-800 text-white"
            : "text-navy-800/70 hover:bg-navy-800/10 hover:text-navy-800",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-navy-800/15" aria-hidden />;
}

function normalizeLinkUrl(url: string): string {
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
}

function editLink(editor: Editor) {
  const previousUrl = editor.getAttributes("link").href as string | undefined;

  if (!editor.state.selection.empty && !editor.isActive("link")) {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
    );
    if (!selectedText.trim()) return;
  }

  const url = window.prompt(
    previousUrl ? "Link URL (leave empty to remove)" : "Link URL",
    previousUrl ?? "https://",
  );

  if (url === null) return;

  const trimmed = url.trim();
  if (!trimmed) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: normalizeLinkUrl(trimmed) })
    .run();
}

export function RichTextEditor({
  label,
  value,
  placeholder,
  compact = false,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
        link: {
          openOnClick: false,
          autolink: false,
          linkOnPaste: true,
          HTMLAttributes: {
            class: "rich-text-editor__link",
            rel: "noopener noreferrer",
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write content…",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "rich-text-editor__content text-sm leading-[1.55] text-navy-800 outline-none",
          compact ? "rich-text-editor__content--compact" : "min-h-28",
        ),
        style: "padding: 1rem; box-sizing: border-box;",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(normalizeRichTextOutput(currentEditor.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;

    const current = normalizeRichTextOutput(editor.getHTML());
    const incoming = value || "";

    if (incoming !== current) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className={adminLabelClass}>{label}</label>
        <div className="rich-text-editor min-h-28 animate-pulse rounded-[10px] border border-navy-800/15 bg-paper-50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      <div className="rich-text-editor overflow-hidden rounded-[10px] border border-navy-800/15 bg-paper-50">
        <div
          className="flex flex-wrap items-center gap-0.5 border-b border-navy-800/10 px-4 py-2"
          role="toolbar"
          aria-label="Text formatting"
        >
          <ToolbarButton
            title="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton
            title="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <span className="underline">U</span>
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title={editor.isActive("link") ? "Edit link" : "Insert link"}
            active={editor.isActive("link")}
            onClick={() => editLink(editor)}
          >
            <Link2 className="size-4" strokeWidth={2} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-4" strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            title="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-4" strokeWidth={2} />
          </ToolbarButton>
        </div>
        {editor.isActive("link") ? (
          <p className="border-t border-navy-800/10 px-4 py-2 text-xs leading-snug text-navy-800/70">
            Linked to{" "}
            <span className="font-medium text-[#1c4fd9]">
              {(editor.getAttributes("link").href as string) || "—"}
            </span>
          </p>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
