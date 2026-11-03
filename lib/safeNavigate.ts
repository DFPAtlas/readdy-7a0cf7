"use client";

export function afterMount(action: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let cancelled = false;

  const outer = window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (!cancelled) action();
    });
  });

  return () => {
    cancelled = true;
    window.cancelAnimationFrame(outer);
  };
}