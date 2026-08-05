import { FormEvent, useState } from "react";
import { CompareLeg } from "../types";
import AirportAutocomplete from "./AirportAutocomplete";

interface Props {
  loading: boolean;
  onCompare: (legs: CompareLeg[]) => void;
}

const today = new Date().toISOString().slice(0, 10);
const MAX_LEGS = 5;

function emptyLeg(): CompareLeg {
  return { origin: "", destination: "", departureDate: today, returnDate: "" };
}

export default function CompareForm({ loading, onCompare }: Props) {
  const [legs, setLegs] = useState<CompareLeg[]>([emptyLeg(), emptyLeg()]);

  function updateLeg(index: number, patch: Partial<CompareLeg>) {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, ...patch } : leg)));
  }

  function addLeg() {
    if (legs.length >= MAX_LEGS) return;
    setLegs((prev) => [...prev, emptyLeg()]);
  }

  function removeLeg(index: number) {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validLegs = legs.filter((leg) => leg.origin && leg.destination && leg.departureDate);
    if (validLegs.length === 0) return;
    onCompare(
      validLegs.map((leg) => ({
        ...leg,
        returnDate: leg.returnDate ? leg.returnDate : undefined,
      }))
    );
  }

  return (
    <form className="compare-form" onSubmit={handleSubmit}>
      <p className="hint">新增多組出發地/目的地/日期，一次比較最多 {MAX_LEGS} 組行程，找出最划算的組合。</p>

      {legs.map((leg, index) => (
        <div className="compare-leg" key={index}>
          <span className="leg-index">{index + 1}</span>
          <AirportAutocomplete label="出發地" value={leg.origin} onChange={(v) => updateLeg(index, { origin: v })} />
          <AirportAutocomplete
            label="目的地"
            value={leg.destination}
            onChange={(v) => updateLeg(index, { destination: v })}
          />
          <label>
            出發日期
            <input
              type="date"
              min={today}
              value={leg.departureDate}
              onChange={(e) => updateLeg(index, { departureDate: e.target.value })}
            />
          </label>
          <label>
            回程日期（選填）
            <input
              type="date"
              min={leg.departureDate || today}
              value={leg.returnDate}
              onChange={(e) => updateLeg(index, { returnDate: e.target.value })}
            />
          </label>
          {legs.length > 1 && (
            <button type="button" className="remove-leg" onClick={() => removeLeg(index)}>
              移除
            </button>
          )}
        </div>
      ))}

      <div className="compare-form-actions">
        <button type="button" onClick={addLeg} disabled={legs.length >= MAX_LEGS}>
          + 新增比較組合
        </button>
        <button type="submit" disabled={loading}>
          {loading ? "比較中..." : "開始比較"}
        </button>
      </div>
    </form>
  );
}
