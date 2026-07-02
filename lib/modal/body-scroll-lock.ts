let lockCount = 0;
let savedScrollY = 0;

function notifyScrollLockChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("app:scroll-lock-change"));
}

export function lockBodyScroll() {
  lockCount += 1;
  if (lockCount > 1) {
    return unlockBodyScroll;
  }

  savedScrollY = window.scrollY;
  const { body, documentElement } = document;

  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  documentElement.style.overflow = "hidden";
  notifyScrollLockChange();

  return unlockBodyScroll;
}

export function unlockBodyScroll() {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;

  const { body, documentElement } = document;

  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.overflow = "";
  documentElement.style.overflow = "";

  window.scrollTo(0, savedScrollY);
  notifyScrollLockChange();
}

/** iOS Safari auto-zooms focused inputs below 16px. */
export const modalInputClass =
  "w-full rounded-md border border-navy-800/20 bg-white px-3 text-base text-navy-800 outline-none placeholder:text-navy-800/40 focus:border-navy-800/50";

export function shouldAutofocusModalField() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}
