import { TAIWAN_HOLIDAYS } from "./holidays";

export interface DatePair {
  departDate: string;
  returnDate: string;
  label: string;
}

const FRI = 5;
const SAT = 6;

export function weekdayOf(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

export function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function holidayContaining(dateStr: string) {
  return TAIWAN_HOLIDAYS.find((h) => dateStr >= addDays(h.start, -1) && dateStr <= h.end) ?? null;
}

// Given a candidate departure date, the return-date pairs worth checking:
// a Friday/Saturday start gets the following weekend shape, and a date
// touching a holiday window gets that holiday's span.
export function pairsForDepartureDate(departDate: string): DatePair[] {
  const pairs: DatePair[] = [];
  const weekday = weekdayOf(departDate);

  if (weekday === FRI) {
    pairs.push({ departDate, returnDate: addDays(departDate, 2), label: "週五-週日" });
    pairs.push({ departDate, returnDate: addDays(departDate, 3), label: "週五-週一" });
  } else if (weekday === SAT) {
    pairs.push({ departDate, returnDate: addDays(departDate, 2), label: "週六-週一" });
  }

  const holiday = holidayContaining(departDate);
  if (holiday) {
    pairs.push({ departDate, returnDate: holiday.end, label: holiday.name });
  }

  return pairs;
}
