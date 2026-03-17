"use client";

import dynamic from "next/dynamic";

const CommandPalette = dynamic(
  () => import("@/components/CommandPalette").then((m) => ({ default: m.CommandPalette })),
  { ssr: false }
);

export function LazyCommandPalette() {
  return <CommandPalette />;
}
