import { FlightOffer, Segment } from "./types";

function parseIsoDurationToMinutes(iso: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  const hours = match?.[1] ? parseInt(match[1], 10) : 0;
  const minutes = match?.[2] ? parseInt(match[2], 10) : 0;
  return hours * 60 + minutes;
}

function toSegments(rawSegments: any[]): Segment[] {
  return rawSegments.map((seg: any) => ({
    carrierCode: seg.marketing_carrier?.iata_code ?? "",
    flightNumber: `${seg.marketing_carrier?.iata_code ?? ""}${seg.marketing_carrier_flight_number ?? ""}`,
    departureAirport: seg.origin.iata_code,
    departureTime: seg.departing_at,
    arrivalAirport: seg.destination.iata_code,
    arrivalTime: seg.arriving_at,
    durationMinutes: parseIsoDurationToMinutes(seg.duration),
  }));
}

// Duffel doesn't always populate slices[].duration (seen as missing on some
// connecting itineraries), so derive elapsed time from the segment timestamps
// we already trust instead of relying on that field.
function elapsedMinutes(segments: Segment[]): number {
  if (segments.length === 0) return 0;
  const start = new Date(segments[0].departureTime).getTime();
  const end = new Date(segments[segments.length - 1].arrivalTime).getTime();
  return Math.round((end - start) / 60000);
}

export function normalizeOffer(raw: any): FlightOffer {
  const slices = raw.slices ?? [];
  const outboundSlice = slices[0];
  const inboundSlice = slices[1] ?? null;

  const outbound = toSegments(outboundSlice?.segments ?? []);
  const inbound = inboundSlice ? toSegments(inboundSlice.segments) : null;

  const totalDurationMinutes = elapsedMinutes(outbound) + (inbound ? elapsedMinutes(inbound) : 0);

  return {
    id: raw.id,
    price: parseFloat(raw.total_amount),
    currency: raw.total_currency,
    totalDurationMinutes,
    stops: Math.max(outbound.length - 1, inbound ? inbound.length - 1 : 0),
    outbound,
    inbound,
    validatingAirline: raw.owner?.iata_code ?? raw.owner?.name ?? "",
    seatsLeft: null,
  };
}

export function normalizeOffers(rawOffers: any[]): FlightOffer[] {
  return rawOffers.map(normalizeOffer);
}
