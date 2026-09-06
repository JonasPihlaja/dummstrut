"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

export type BetView = "grid" | "cards";

interface BetViewToggleProps {
  className?: string;
}

export function BetViewToggle({
  className = "",
}: BetViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view: BetView =
    searchParams.get("view") === "cards" ? "cards" : "grid";

  function switchView(next: BetView) {
    if (next === view) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  const baseClass =
    "flex items-center gap-1 rounded-full bg-white border border-gray-200 p-1 shadow-sm";

  const buttonClass = (active: boolean, colorClass: string) =>
    `cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      active
        ? `text-white ${colorClass}`
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className={baseClass.concat(" ", className)} role="tablist" aria-label="View mode">
      <button
        type="button"
        role="tab"
        aria-selected={view === "grid"}
        onClick={() => switchView("grid")}
        className={buttonClass(view === "grid", "bg-gray-700")}
      >
        <span aria-hidden>▦</span> Grid
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "cards"}
        onClick={() => switchView("cards")}
        className={buttonClass(view === "cards", "bg-gradient-to-r from-pink-600 to-rose-500")}
      >
        <span aria-hidden>🃏</span> Cards
      </button>
    </div>
  );
}