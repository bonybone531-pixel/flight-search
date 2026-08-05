import { Router } from "express";
import { describeDuffelError, isMissingCredentials, searchFlights } from "../flightSearch";
import { SearchRequest } from "../types";

const router = Router();

router.post("/", async (req, res) => {
  const body = req.body as SearchRequest;

  if (!body.origin || !body.destination || !body.departureDate) {
    res.status(400).json({ error: "origin, destination, departureDate 為必填欄位" });
    return;
  }

  try {
    const offers = await searchFlights(body);
    res.json({ offers });
  } catch (err) {
    console.error("Flight search failed:", err);
    res.status(isMissingCredentials(err) ? 503 : 502).json({ error: describeDuffelError(err) });
  }
});

export default router;
