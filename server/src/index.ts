import "dotenv/config";
import cors from "cors";
import express from "express";
import airportsRouter from "./routes/airports";
import compareRouter from "./routes/compare";
import searchRouter from "./routes/search";

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    duffelConfigured: Boolean(process.env.DUFFEL_API_TOKEN),
  });
});

app.use("/api/airports", airportsRouter);
app.use("/api/search", searchRouter);
app.use("/api/compare", compareRouter);

app.listen(port, () => {
  console.log(`Flight search server listening on http://localhost:${port}`);
});
