import { useState } from "react";
import { compareFlights, searchFlights } from "./api";
import CompareForm from "./components/CompareForm";
import CompareResults from "./components/CompareResults";
import ResultsList from "./components/ResultsList";
import SearchForm from "./components/SearchForm";
import SortFilterBar, { applySortAndFilter, FilterState, SortKey } from "./components/SortFilterBar";
import { CompareLeg, CompareResponse, FlightOffer, SearchFormValues } from "./types";

type Tab = "search" | "compare";

export default function App() {
  const [tab, setTab] = useState<Tab>("search");

  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [filter, setFilter] = useState<FilterState>({ maxStops: null, airlines: [], maxPrice: null });

  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  async function handleSearch(values: SearchFormValues) {
    setSearchLoading(true);
    setSearchError(null);
    setFilter({ maxStops: null, airlines: [], maxPrice: null });
    try {
      const results = await searchFlights({
        origin: values.origin,
        destination: values.destination,
        departureDate: values.departureDate,
        returnDate: values.tripType === "roundtrip" ? values.returnDate : undefined,
        adults: values.adults,
        travelClass: values.travelClass,
      });
      setOffers(results);
    } catch (err) {
      setOffers([]);
      setSearchError(err instanceof Error ? err.message : "搜尋失敗");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleCompare(legs: CompareLeg[]) {
    setCompareLoading(true);
    setCompareError(null);
    try {
      const result = await compareFlights(legs);
      setCompareResult(result);
    } catch (err) {
      setCompareResult(null);
      setCompareError(err instanceof Error ? err.message : "比較失敗");
    } finally {
      setCompareLoading(false);
    }
  }

  const visibleOffers = applySortAndFilter(offers, sortKey, filter);

  return (
    <div className="app">
      <header>
        <h1>機票搜尋</h1>
        <nav className="tabs">
          <button className={tab === "search" ? "active" : ""} onClick={() => setTab("search")}>
            搜尋
          </button>
          <button className={tab === "compare" ? "active" : ""} onClick={() => setTab("compare")}>
            多城市/日期比較
          </button>
        </nav>
      </header>

      <main>
        {tab === "search" && (
          <section>
            <SearchForm loading={searchLoading} onSearch={handleSearch} />
            {searchError && <p className="error-banner">{searchError}</p>}
            {offers.length > 0 && (
              <SortFilterBar
                offers={offers}
                sortKey={sortKey}
                onSortChange={setSortKey}
                filter={filter}
                onFilterChange={setFilter}
              />
            )}
            {!searchLoading && offers.length > 0 && <ResultsList offers={visibleOffers} />}
          </section>
        )}

        {tab === "compare" && (
          <section>
            <CompareForm loading={compareLoading} onCompare={handleCompare} />
            {compareError && <p className="error-banner">{compareError}</p>}
            {compareResult && <CompareResults result={compareResult} />}
          </section>
        )}
      </main>
    </div>
  );
}
