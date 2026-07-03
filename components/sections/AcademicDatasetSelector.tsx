"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { lockBodyScroll } from "@/lib/modal/body-scroll-lock";
import type { AcademicDataset } from "@/lib/academic-data/types";

type AcademicDatasetSelectorProps = {
  datasets: AcademicDataset[];
  activeId: string;
  onChange: (id: string) => void;
};

const OPTION_HEIGHT = 44;
const MENU_PADDING = 12;
const MENU_GAP = 8;

function estimateMenuHeight(itemCount: number) {
  return itemCount * OPTION_HEIGHT + MENU_PADDING;
}

function DatasetIndex({
  index,
  selected = false,
}: {
  index: number;
  selected?: boolean;
}) {
  return (
    <span
      className={cn(
        "w-6 shrink-0 text-xs font-semibold tabular-nums lg:text-base",
        selected ? "text-navy-800" : "text-navy-800/50",
      )}
      aria-hidden
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

export function AcademicDatasetSelector({
  datasets,
  activeId,
  onChange,
}: AcademicDatasetSelectorProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [openAbove, setOpenAbove] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const activeIndex = datasets.findIndex((dataset) => dataset.id === activeId);
  const active = datasets[activeIndex >= 0 ? activeIndex : 0];

  const close = useCallback(() => setOpen(false), []);

  const select = useCallback(
    (id: string) => {
      onChange(id);
      close();
      triggerRef.current?.focus();
    },
    [onChange, close],
  );

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = estimateMenuHeight(datasets.length);
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const shouldOpenAbove =
      spaceBelow < menuHeight && rect.top > window.innerHeight - rect.bottom;

    setOpenAbove(shouldOpenAbove);
    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 50,
      ...(shouldOpenAbove
        ? { bottom: window.innerHeight - rect.top + MENU_GAP }
        : { top: rect.bottom + MENU_GAP }),
    });
  }, [datasets.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    const unlock = lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      close();
    };

    const onViewportChange = () => updateMenuPosition();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      unlock();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, close, updateMenuPosition]);

  if (!active) return null;

  const menu =
    open && mounted
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-40 bg-navy-900/45"
              aria-hidden
              onClick={close}
            />
            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Select dataset"
              style={menuStyle}
              className={cn(
                "overflow-hidden rounded-xl border border-navy-800/10 bg-white p-1.5 shadow-[0_12px_40px_rgba(15,31,61,0.2)]",
                openAbove ? "origin-bottom" : "origin-top",
              )}
            >
              {datasets.map((dataset, index) => {
                const selected = dataset.id === activeId;

                return (
                  <button
                    key={dataset.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => select(dataset.id)}
                    className={cn(
                      "flex w-full min-h-11 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-accent/70",
                      selected
                        ? "bg-paper-100 text-navy-800"
                        : "text-navy-800 hover:bg-paper-50",
                    )}
                  >
                    <DatasetIndex index={index} selected={selected} />
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-sm leading-snug lg:text-base",
                        selected ? "font-semibold" : "font-medium",
                      )}
                    >
                      {dataset.label}
                    </span>
                    {selected ? (
                      <Check
                        className="size-4 shrink-0 text-navy-800"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id="academic-dataset-select"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-12 w-full max-w-xl items-center justify-between gap-3 rounded-xl border bg-white px-4 text-left shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-[border-color,box-shadow]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800",
          open
            ? "border-gold-accent"
            : "border-white/30 hover:border-white/50",
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <DatasetIndex index={activeIndex} selected />
          <span className="truncate text-sm font-semibold text-navy-800 sm:text-base lg:text-base">
            {active.label}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-navy-800 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {menu}
    </>
  );
}
