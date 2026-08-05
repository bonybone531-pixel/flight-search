const BASE_URL = "https://api.travelpayouts.com";

function getToken(): string {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) {
    throw new Error("TRAVELPAYOUTS_TOKEN 未設定");
  }
  return token;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// /v1/prices/direct is rate-limited much more tightly than /v1/prices/calendar
// (observed 429s well before the documented calendar limit). Back off and
// retry a couple of times rather than treating a rate-limit hit as "no data".
async function get(path: string, params: Record<string, string>): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("token", getToken());

  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url.toString());
    if (response.status === 429) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (!response.ok) {
      throw new Error(`Travelpayouts API 錯誤（${response.status}）: ${path}`);
    }
    const body = (await response.json()) as any;
    if (body.success === false) {
      throw new Error(`Travelpayouts API 回傳失敗: ${path}`);
    }
    return body.data ?? {};
  }
  throw new Error(`Travelpayouts API 錯誤（429，重試多次仍被限流）: ${path}`);
}

// Discover which destinations currently have cached direct-flight fares from `origin`.
export async function discoverDirectDestinations(origin: string): Promise<string[]> {
  const data = await get("/v1/prices/direct", { origin, currency: "twd" });
  return Object.keys(data);
}

// Which departure dates have ANY cached fare for this route, regardless of
// what return date the calendar endpoint happens to pair it with — one call
// covers many months (Travelpayouts returns its whole cache, not just the
// queried month), so this is cheap and used only to narrow down which dates
// are worth a precise follow-up query.
export async function getCachedDepartureDates(origin: string, destination: string): Promise<string[]> {
  const data = await get("/v1/prices/calendar", {
    origin,
    destination,
    depart_date: new Date().toISOString().slice(0, 7),
    calendar_type: "departure_date",
    currency: "twd",
  });
  return Object.keys(data);
}

export interface DirectFare {
  price: number;
  airline: string;
  departure_at: string;
  return_at: string;
  flight_number: number;
}

// Cached direct-flight price for one exact departure/return date pair, if any
// user has searched (and Aviasales cached) that combination recently.
export async function getExactFare(
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string
): Promise<DirectFare | null> {
  const data = await get("/v1/prices/direct", {
    origin,
    destination,
    depart_date: departDate,
    return_date: returnDate,
    currency: "twd",
  });
  // Response is keyed by destination, then by an arbitrary index per fare found:
  // { [destination]: { "0": {...fare}, "1": {...fare} } }
  const entries = Object.values(data).flatMap((byIndex: any) => Object.values(byIndex)) as DirectFare[];
  if (entries.length === 0) return null;
  return entries.reduce((best, entry) => (!best || entry.price < best.price ? entry : best));
}
