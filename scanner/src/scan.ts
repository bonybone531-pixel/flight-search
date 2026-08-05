import { addDays, generateTargetDatePairs } from "./dateMatcher";
import { computeBaseline, HistoryEntry, loadHistory, saveHistory } from "./history";
import { DirectFare, discoverDirectDestinations, getExactFare } from "./travelpayouts";

const ORIGIN = "RMQ";
const WINDOW_DAYS = 183;
const REQUEST_DELAY_MS = 120;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface BestFare extends DirectFare {
  label: string;
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[scan] ${today} 開始掃描 ${ORIGIN} 直飛特價`);

  const destinations = await discoverDirectDestinations(ORIGIN);
  console.log(`[scan] 發現 ${destinations.length} 個直飛航點: ${destinations.join(", ")}`);

  const datePairs = generateTargetDatePairs(today, addDays(today, WINDOW_DAYS));
  console.log(`[scan] 產生 ${datePairs.length} 組候選日期（週末/連假）`);

  const bestByDestination = new Map<string, BestFare>();

  for (const destination of destinations) {
    let best: BestFare | null = null;
    for (const pair of datePairs) {
      try {
        const fare = await getExactFare(ORIGIN, destination, pair.departDate, pair.returnDate);
        if (fare && (!best || fare.price < best.price)) best = { ...fare, label: pair.label };
      } catch (err) {
        console.error(`[scan] ${destination} ${pair.departDate}->${pair.returnDate} 查詢失敗:`, err);
      }
      await sleep(REQUEST_DELAY_MS);
    }
    if (best) {
      bestByDestination.set(destination, best);
      console.log(`[scan] ${destination} 最佳價格: ${best.price} (${best.label}, ${best.departure_at} -> ${best.return_at})`);
    } else {
      console.log(`[scan] ${destination} 無符合週末/連假條件的直飛快取資料`);
    }
  }

  const todaysPrices: Record<string, number> = {};
  for (const [destination, fare] of bestByDestination) todaysPrices[destination] = fare.price;

  const history = loadHistory();
  const newEntries: HistoryEntry[] = [];

  for (const [destination, fare] of bestByDestination) {
    const baseline = computeBaseline(history, destination, todaysPrices);
    const isDeal = fare.price <= baseline * 0.7;
    newEntries.push({
      scanDate: today,
      destination,
      price: fare.price,
      baseline: Math.round(baseline),
      isDeal,
      airline: fare.airline,
      departureAt: fare.departure_at,
      returnAt: fare.return_at,
      transfers: 0,
    });
    if (isDeal) {
      console.log(`[scan] 🔥 特價！${destination} ${fare.price} <= 基準 ${Math.round(baseline)} 的 70%`);
    }
  }

  saveHistory([...history, ...newEntries]);
  console.log(`[scan] 完成，新增 ${newEntries.length} 筆紀錄，歷史累積共 ${history.length + newEntries.length} 筆`);
}

main().catch((err) => {
  console.error("[scan] 執行失敗:", err);
  process.exit(1);
});
