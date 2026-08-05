const BASE_URL = "https://api.travelpayouts.com";

function getToken(): string {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) {
    throw new Error("TRAVELPAYOUTS_TOKEN 未設定");
  }
  return token;
}

async function get(path: string, params: Record<string, string>): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("token", getToken());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Travelpayouts API 錯誤（${response.status}）: ${path}`);
  }
  const body = (await response.json()) as any;
  if (body.success === false) {
    throw new Error(`Travelpayouts API 回傳失敗: ${path}`);
  }
  return body.data ?? {};
}

// Discover which destinations currently have cached direct-flight fares from `origin`.
export async function discoverDirectDestinations(origin: string): Promise<string[]> {
  const data = await get("/v1/prices/direct", { origin, currency: "twd" });
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
