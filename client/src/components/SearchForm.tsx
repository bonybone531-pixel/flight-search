import { FormEvent, useState } from "react";
import { SearchFormValues } from "../types";
import AirportAutocomplete from "./AirportAutocomplete";

interface Props {
  loading: boolean;
  onSearch: (values: SearchFormValues) => void;
}

const today = new Date().toISOString().slice(0, 10);

export default function SearchForm({ loading, onSearch }: Props) {
  const [values, setValues] = useState<SearchFormValues>({
    origin: "",
    destination: "",
    departureDate: today,
    returnDate: "",
    tripType: "oneway",
    adults: 1,
    travelClass: "ECONOMY",
  });

  function update<K extends keyof SearchFormValues>(key: K, value: SearchFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values.origin || !values.destination || !values.departureDate) return;
    if (values.tripType === "roundtrip" && !values.returnDate) return;
    onSearch(values);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="trip-type-toggle">
        <label>
          <input
            type="radio"
            checked={values.tripType === "oneway"}
            onChange={() => update("tripType", "oneway")}
          />
          單程
        </label>
        <label>
          <input
            type="radio"
            checked={values.tripType === "roundtrip"}
            onChange={() => update("tripType", "roundtrip")}
          />
          來回
        </label>
      </div>

      <div className="form-row">
        <AirportAutocomplete label="出發地" value={values.origin} onChange={(v) => update("origin", v)} />
        <AirportAutocomplete
          label="目的地"
          value={values.destination}
          onChange={(v) => update("destination", v)}
        />
      </div>

      <div className="form-row">
        <label>
          出發日期
          <input
            type="date"
            min={today}
            value={values.departureDate}
            onChange={(e) => update("departureDate", e.target.value)}
            required
          />
        </label>
        {values.tripType === "roundtrip" && (
          <label>
            回程日期
            <input
              type="date"
              min={values.departureDate || today}
              value={values.returnDate}
              onChange={(e) => update("returnDate", e.target.value)}
              required
            />
          </label>
        )}
        <label>
          人數
          <input
            type="number"
            min={1}
            max={9}
            value={values.adults}
            onChange={(e) => update("adults", Number(e.target.value))}
          />
        </label>
        <label>
          艙等
          <select value={values.travelClass} onChange={(e) => update("travelClass", e.target.value as any)}>
            <option value="ECONOMY">經濟艙</option>
            <option value="PREMIUM_ECONOMY">豪華經濟艙</option>
            <option value="BUSINESS">商務艙</option>
            <option value="FIRST">頭等艙</option>
          </select>
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "搜尋中..." : "搜尋航班"}
      </button>
    </form>
  );
}
