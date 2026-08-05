import { Router } from "express";
import { fetchPlaceSuggestions, MissingCredentialsError } from "../duffelClient";

const router = Router();

router.get("/", async (req, res) => {
  const keyword = String(req.query.keyword ?? "").trim();

  if (keyword.length < 2) {
    res.json({ locations: [] });
    return;
  }

  try {
    const places = await fetchPlaceSuggestions(keyword);

    const locations = places
      .filter((place: any) => place.iata_code)
      .slice(0, 10)
      .map((place: any) => ({
        iataCode: place.iata_code,
        name: place.name,
        city: place.city_name ?? place.city?.name,
        country: place.iata_country_code,
        subType: place.type === "city" ? "CITY" : "AIRPORT",
      }));

    res.json({ locations });
  } catch (err) {
    if (err instanceof MissingCredentialsError) {
      res.status(503).json({ error: err.message });
      return;
    }
    console.error("Airport search failed:", err);
    res.status(502).json({ error: "機場搜尋時發生錯誤" });
  }
});

export default router;
