export interface HolidayRange {
  name: string;
  start: string;
  end: string;
}

// Source: 行政院人事行政總處 115年/116年政府行政機關辦公日曆表.
// Update once a year when the next year's calendar is gazetted.
export const TAIWAN_HOLIDAYS: HolidayRange[] = [
  { name: "中秋節/教師節", start: "2026-09-25", end: "2026-09-28" },
  { name: "國慶日", start: "2026-10-09", end: "2026-10-11" },
  { name: "台灣光復節", start: "2026-10-24", end: "2026-10-26" },
  { name: "行憲紀念日", start: "2026-12-25", end: "2026-12-27" },
  { name: "元旦", start: "2027-01-01", end: "2027-01-03" },
  { name: "農曆春節", start: "2027-02-04", end: "2027-02-10" },
];

export function findHoliday(dateIso: string): HolidayRange | null {
  const date = dateIso.slice(0, 10);
  return TAIWAN_HOLIDAYS.find((h) => date >= h.start && date <= h.end) ?? null;
}
