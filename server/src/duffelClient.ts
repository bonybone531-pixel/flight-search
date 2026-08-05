import { Duffel } from "@duffel/api";

let client: any = null;

export class MissingCredentialsError extends Error {
  constructor() {
    super(
      "Duffel API token 尚未設定，請在 server/.env 填入 DUFFEL_API_TOKEN（參考 server/.env.example）"
    );
    this.name = "MissingCredentialsError";
  }
}

export function getDuffelClient(): any {
  if (client) return client;

  const token = process.env.DUFFEL_API_TOKEN;
  if (!token) {
    throw new MissingCredentialsError();
  }

  client = new Duffel({ token });
  return client;
}

const PLACES_BASE_URL = "https://api.duffel.com/places/suggestions";

export async function fetchPlaceSuggestions(query: string): Promise<any[]> {
  const token = process.env.DUFFEL_API_TOKEN;
  if (!token) {
    throw new MissingCredentialsError();
  }

  const response = await fetch(`${PLACES_BASE_URL}?query=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Duffel-Version": "v2",
      Accept: "application/json",
    },
  });

  const body: any = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = body?.errors?.[0]?.message ?? body?.errors?.[0]?.title ?? `Duffel API 錯誤（${response.status}）`;
    throw new Error(detail);
  }

  return body.data ?? [];
}

export function describeDuffelError(err: unknown): string {
  if (err instanceof MissingCredentialsError) {
    return err.message;
  }
  const duffelErr = err as any;
  return (
    duffelErr?.errors?.[0]?.message ??
    duffelErr?.errors?.[0]?.title ??
    duffelErr?.message ??
    "查詢航班時發生未預期的錯誤"
  );
}

export function isMissingCredentials(err: unknown): boolean {
  return err instanceof MissingCredentialsError;
}
