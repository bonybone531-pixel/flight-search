import { TAIWAN_HOLIDAYS } from "./holidays";

export interface DatePair {
  departDate: string;
  returnDate: string;
  label: string;
}

const FRI = 5;
const SAT = 6;

function weekdayOf(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

export function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// Every Friday/Saturday departure in the window paired with the following
// Sun/Mon return, plus one span per upcoming national holiday — this is the
// concrete set of date pairs we ask Travelpayouts about, rather than trying
// to infer trip shape after the fact from whatever a broader query returns.
export function generateTargetDatePairs(rangeStartIso: string, rangeEndIsoExclusive: string): DatePair[] {
  const pairs: DatePair[] = [];

  for (let cursor = rangeStartIso; cursor < rangeEndIsoExclusive; cursor = addDays(cursor, 1)) {
    const weekday = weekdayOf(cursor);
    if (weekday === FRI) {
      pairs.push({ departDate: cursor, returnDate: addDays(cursor, 2), label: "週五-週日" });
      pairs.push({ departDate: cursor, returnDate: addDays(cursor, 3), label: "週五-週一" });
    } else if (weekday === SAT) {
      pairs.push({ departDate: cursor, returnDate: addDays(cursor, 2), label: "週六-週一" });
    }
  }

  for (const holiday of TAIWAN_HOLIDAYS) {
    if (holiday.start >= rangeStartIso && holiday.start < rangeEndIsoExclusive) {
      pairs.push({ departDate: addDays(holiday.start, -1), returnDate: holiday.end, label: holiday.name });
      pairs.push({ departDate: holiday.start, returnDate: holiday.end, label: holiday.name });
    }
  }

  return pairs;
}
