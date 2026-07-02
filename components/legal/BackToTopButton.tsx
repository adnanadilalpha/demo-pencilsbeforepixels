"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER = 480;

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-paper-300 bg-paper-50 px-4 py-2.5 text-sm font-medium text-navy-800 shadow-[0_8px_24px_rgba(15,31,61,0.08)] transition-all duration-300 hover:border-gold-500/40 hover:text-gold-500 max-lg:bottom-5 max-lg:right-5 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
        className="text-current"
      >
        <path
          d="M7 3L7 11M7 3L4 6M7 3L10 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back to top
    </button>
  );
}
