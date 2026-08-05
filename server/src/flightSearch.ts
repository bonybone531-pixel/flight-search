import { describeDuffelError, getDuffelClient, isMissingCredentials } from "./duffelClient";
import { normalizeOffers } from "./normalize";
import { FlightOffer, SearchRequest } from "./types";

export { describeDuffelError, isMissingCredentials };

const CABIN_CLASS_MAP: Record<string, string> = {
  ECONOMY: "economy",
  PREMIUM_ECONOMY: "premium_economy",
  BUSINESS: "business",
  FIRST: "first",
};

export async function searchFlights(request: SearchRequest): Promise<FlightOffer[]> {
  const duffel = getDuffelClient();

  const slices: { origin: string; destination: string; departure_date: string }[] = [
    {
      origin: request.origin.toUpperCase(),
      destination: request.destination.toUpperCase(),
      departure_date: request.departureDate,
    },
  ];

  if (request.returnDate) {
    slices.push({
      origin: request.destination.toUpperCase(),
      destination: request.origin.toUpperCase(),
      departure_date: request.returnDate,
    });
  }

  const passengers = Array.from({ length: request.adults ?? 1 }, () => ({ type: "adult" }));

  const offerRequest: Record<string, unknown> = {
    slices,
    passengers,
    cabin_class: CABIN_CLASS_MAP[request.travelClass ?? "ECONOMY"] ?? "economy",
    return_offers: true,
  };
  if (request.nonStop) offerRequest.max_connections = 0;

  const response = await duffel.offerRequests.create(offerRequest);
  const offers = (response.data?.offers ?? []).slice(0, Math.min(request.max ?? 50, 100));

  return normalizeOffers(offers);
}
