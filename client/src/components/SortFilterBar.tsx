import { FlightOffer } from "../types";

export type SortKey = "price" | "duration" | "stops";

export interface FilterState {
  maxStops: number | null;
  airlines: string[];
  maxPrice: number | null;
}

interface Props {
  offers: FlightOffer[];
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

export function applySortAndFilter(offers: FlightOffer[], sortKey: SortKey, filter: FilterState): FlightOffer[] {
  const filtered = offers.filter((offer) => {
    if (filter.maxStops !== null && offer.stops > filter.maxStops) return false;
    if (filter.airlines.length > 0 && !filter.airlines.includes(offer.validatingAirline)) return false;
    if (filter.maxPrice !== null && offer.price > filter.maxPrice) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortKey === "price") return a.price - b.price;
    if (sortKey === "duration") return a.totalDurationMinutes - b.totalDurationMinutes;
    return a.stops - b.stops;
  });
}

export default function SortFilterBar({ offers, sortKey, onSortChange, filter, onFilterChange }: Props) {
  const airlines = Array.from(new Set(offers.map((o) => o.validatingAirline))).sort();
  const maxObservedPrice = offers.reduce((max, o) => Math.max(max, o.price), 0);

  function toggleAirline(code: string) {
    const nextAirlines = filter.airlines.includes(code)
      ? filter.airlines.filter((a) => a !== code)
      : [...filter.airlines, code];
    onFilterChange({ ...filter, airlines: nextAirlines });
  }

  return (
    <div className="sort-filter-bar">
      <div className="sort-controls">
        <span>排序：</span>
        {(["price", "duration", "stops"] as SortKey[]).map((key) => (
          <button
            key={key}
            className={sortKey === key ? "active" : ""}
            onClick={() => onSortChange(key)}
            type="button"
          >
            {key === "price" ? "價格" : key === "duration" ? "飛行時間" : "轉機次數"}
          </button>
        ))}
      </div>

      <div className="filter-controls">
        <label>
          最多轉機
          <select
            value={filter.maxStops ?? ""}
            onChange={(e) => onFilterChange({ ...filter, maxStops: e.target.value === "" ? null : Number(e.target.value) })}
          >
            <option value="">不限</option>
            <option value="0">直飛</option>
            <option value="1">最多轉機 1 次</option>
            <option value="2">最多轉機 2 次</option>
          </select>
        </label>

        {maxObservedPrice > 0 && (
          <label>
            最高價格：{filter.maxPrice ?? maxObservedPrice}
            <input
              type="range"
              min={0}
              max={Math.ceil(maxObservedPrice)}
              value={filter.maxPrice ?? maxObservedPrice}
              onChange={(e) => onFilterChange({ ...filter, maxPrice: Number(e.target.value) })}
            />
          </label>
        )}

        {airlines.length > 1 && (
          <div className="airline-filter">
            {airlines.map((code) => (
              <label key={code} className="airline-checkbox">
                <input
                  type="checkbox"
                  checked={filter.airlines.includes(code)}
                  onChange={() => toggleAirline(code)}
                />
                {code}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
