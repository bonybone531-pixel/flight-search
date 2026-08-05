import { FlightOffer } from "../types";
import FlightCard from "./FlightCard";

export default function ResultsList({ offers }: { offers: FlightOffer[] }) {
  if (offers.length === 0) {
    return <p className="empty-state">沒有符合條件的航班，試試調整篩選條件。</p>;
  }

  return (
    <div className="results-list">
      {offers.map((offer) => (
        <FlightCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
