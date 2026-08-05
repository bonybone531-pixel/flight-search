import { AirportLocation, CompareLeg, CompareResponse, FlightOffer } from "./types";

async function parseJsonOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? `請求失敗（${response.status}）`);
  }
  return body;
}

export async function searchAirports(keyword: string): Promise<AirportLocation[]> {
  const response = await fetch(`/api/airports?keyword=${encodeURIComponent(keyword)}`);
  const body = await parseJsonOrThrow(response);
  return body.locations;
}

export interface SearchFlightsParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  travelClass?: string;
}

export async function searchFlights(params: SearchFlightsParams): Promise<FlightOffer[]> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const body = await parseJsonOrThrow(response);
  return body.offers;
}

export async function compareFlights(legs: CompareLeg[], adults?: number): Promise<CompareResponse> {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ legs, adults }),
  });
  return parseJsonOrThrow(response);
}
