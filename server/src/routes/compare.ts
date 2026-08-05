import { Router } from "express";
import { describeDuffelError, isMissingCredentials, searchFlights } from "../flightSearch";
import { CompareLegResult, CompareRequest, CompareResponse, FlightOffer } from "../types";

const router = Router();
const MAX_LEGS = 5;

function pickCheapest(offers: FlightOffer[]): FlightOffer | null {
  return offers.reduce<FlightOffer | null>(
    (best, offer) => (!best || offer.price < best.price ? offer : best),
    null
  );
}

function pickFastest(offers: FlightOffer[]): FlightOffer | null {
  return offers.reduce<FlightOffer | null>(
    (best, offer) => (!best || offer.totalDurationMinutes < best.totalDurationMinutes ? offer : best),
    null
  );
}

router.post("/", async (req, res) => {
  const body = req.body as CompareRequest;

  if (!body.legs || body.legs.length === 0) {
    res.status(400).json({ error: "legs 至少需要一組出發地/目的地/日期" });
    return;
  }
  if (body.legs.length > MAX_LEGS) {
    res.status(400).json({ error: `一次最多比較 ${MAX_LEGS} 組行程` });
    return;
  }

  try {
    const legResults: CompareLegResult[] = await Promise.all(
      body.legs.map(async (leg): Promise<CompareLegResult> => {
        try {
          const offers = await searchFlights({
            origin: leg.origin,
            destination: leg.destination,
            departureDate: leg.departureDate,
            returnDate: leg.returnDate,
            adults: body.adults,
            currencyCode: body.currencyCode,
          });
          return {
            request: leg,
            offers,
            cheapest: pickCheapest(offers),
            fastest: pickFastest(offers),
          };
        } catch (err) {
          if (isMissingCredentials(err)) throw err;
          console.error("Compare leg failed:", leg, err);
          return {
            request: leg,
            offers: [],
            cheapest: null,
            fastest: null,
            error: describeDuffelError(err),
          };
        }
      })
    );

    let bestOverall: CompareResponse["bestOverall"] = null;
    legResults.forEach((legResult, legIndex) => {
      if (legResult.cheapest && (!bestOverall || legResult.cheapest.price < bestOverall.offer.price)) {
        bestOverall = { legIndex, offer: legResult.cheapest };
      }
    });

    const response: CompareResponse = { legs: legResults, bestOverall };
    res.json(response);
  } catch (err) {
    console.error("Compare failed:", err);
    res.status(isMissingCredentials(err) ? 503 : 502).json({ error: describeDuffelError(err) });
  }
});

export default router;
