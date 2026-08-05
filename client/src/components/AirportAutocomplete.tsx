import { useEffect, useRef, useState } from "react";
import { searchAirports } from "../api";
import { AirportLocation } from "../types";

interface Props {
  label: string;
  value: string;
  onChange: (iataCode: string) => void;
}

export default function AirportAutocomplete({ label, value, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<AirportLocation[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  function handleInput(next: string) {
    setQuery(next.toUpperCase());
    onChange(next.toUpperCase());

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (next.trim().length < 2) {
      setOptions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const locations = await searchAirports(next);
        setOptions(locations);
        setOpen(true);
      } catch {
        setOptions([]);
      }
    }, 300);
  }

  function selectOption(location: AirportLocation) {
    setQuery(location.iataCode);
    onChange(location.iataCode);
    setOpen(false);
  }

  return (
    <div className="autocomplete">
      <label>
        {label}
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => options.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="城市或機場代碼，例如 TPE"
          maxLength={64}
        />
      </label>
      {open && options.length > 0 && (
        <ul className="autocomplete-list">
          {options.map((loc) => (
            <li key={loc.iataCode} onMouseDown={() => selectOption(loc)}>
              <span className="iata">{loc.iataCode}</span>
              <span className="name">
                {loc.name}
                {loc.city ? ` · ${loc.city}` : ""}
                {loc.country ? ` · ${loc.country}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
