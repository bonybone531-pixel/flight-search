export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-TW", { month: "short", day: "numeric" });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}小時${m > 0 ? ` ${m}分` : ""}`;
}

export function formatPrice(price: number, currency: string): string {
  return `${currency} ${price.toLocaleString("zh-TW", { maximumFractionDigits: 0 })}`;
}

export function stopsLabel(stops: number): string {
  return stops === 0 ? "直飛" : `轉機 ${stops} 次`;
}
