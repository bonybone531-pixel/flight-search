import { formatDuration, formatPrice, formatTime, stopsLabel } from "../format";
import { FlightOffer, Segment } from "../types";

function ItinerarySummary({ segments }: { segments: Segment[] }) {
  const first = segments[0];
  const last = segments[segments.length - 1];
  return (
    <div className="itinerary">
      <div className="route">
        <span className="time">{formatTime(first.departureTime)}</span>
        <span className="airport">{first.departureAirport}</span>
        <span className="arrow">→</span>
        <span className="time">{formatTime(last.arrivalTime)}</span>
        <span className="airport">{last.arrivalAirport}</span>
      </div>
      <div className="meta">
        {segments.map((s) => s.flightNumber).join(", ")} · {stopsLabel(segments.length - 1)}
      </div>
    </div>
  );
}

export default function FlightCard({ offer }: { offer: FlightOffer }) {
  return (
    <div className="flight-card">
      <div className="itineraries">
        <ItinerarySummary segments={offer.outbound} />
        {offer.inbound && <ItinerarySummary segments={offer.inbound} />}
      </div>
      <div className="summary">
        <div className="duration">{formatDuration(offer.totalDurationMinutes)}</div>
        <div className="airline">{offer.validatingAirline}</div>
        <div className="price">{formatPrice(offer.price, offer.currency)}</div>
        {offer.seatsLeft !== null && offer.seatsLeft <= 4 && (
          <div className="seats-warning">剩 {offer.seatsLeft} 席</div>
        )}
      </div>
    </div>
  );
}
