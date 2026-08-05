import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

export interface HistoryEntry {
  scanDate: string;
  destination: string;
  price: number;
  baseline: number;
  isDeal: boolean;
  airline: string;
  departureAt: string;
  returnAt: string;
  transfers: number;
}

export const HISTORY_PATH = resolve(__dirname, "../../docs/data/history.json");

export function loadHistory(): HistoryEntry[] {
  if (!existsSync(HISTORY_PATH)) return [];
  return JSON.parse(readFileSync(HISTORY_PATH, "utf-8"));
}

export function saveHistory(entries: HistoryEntry[]): void {
  mkdirSync(dirname(HISTORY_PATH), { recursive: true });
  writeFileSync(HISTORY_PATH, JSON.stringify(entries, null, 2));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Baseline for a destination: median of its own past scan-day prices. Falls
// back to the median across all destinations found today when there's no
// history yet for that destination (e.g. day one, or a newly-opened route).
export function computeBaseline(
  history: HistoryEntry[],
  destination: string,
  todaysPricesByDestination: Record<string, number>
): number {
  const pastPrices = history.filter((e) => e.destination === destination).map((e) => e.price);
  if (pastPrices.length > 0) return median(pastPrices);
  return median(Object.values(todaysPricesByDestination));
}
