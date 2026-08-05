export interface Segment {
  carrierCode: string;
  flightNumber: string;
  departureAirport: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalTime: string;
  durationMinutes: number;
}

export interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  totalDurationMinutes: number;
  stops: number;
  outbound: Segment[];
  inbound: Segment[] | null;
  validatingAirline: string;
  seatsLeft: number | null;
}

export interface AirportLocation {
  iataCode: string;
  name: string;
  city?: string;
  country?: string;
  subType: string;
}

export interface SearchFormValues {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  tripType: "oneway" | "roundtrip";
  adults: number;
  travelClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
}

export interface CompareLeg {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}

export interface CompareLegResult {
  request: CompareLeg;
  offers: FlightOffer[];
  cheapest: FlightOffer | null;
  fastest: FlightOffer | null;
  error?: string;
}

export interface CompareResponse {
  legs: CompareLegResult[];
  bestOverall: { legIndex: number; offer: FlightOffer } | null;
}
