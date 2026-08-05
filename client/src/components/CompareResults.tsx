import { formatDuration, formatPrice } from "../format";
import { CompareResponse } from "../types";

export default function CompareResults({ result }: { result: CompareResponse }) {
  return (
    <div className="compare-results">
      {result.bestOverall && (
        <div className="best-overall">
          最划算組合：第 {result.bestOverall.legIndex + 1} 組，
          {formatPrice(result.bestOverall.offer.price, result.bestOverall.offer.currency)}
        </div>
      )}

      <table className="compare-table">
        <thead>
          <tr>
            <th>組合</th>
            <th>行程</th>
            <th>最便宜</th>
            <th>最快</th>
          </tr>
        </thead>
        <tbody>
          {result.legs.map((legResult, index) => (
            <tr key={index} className={result.bestOverall?.legIndex === index ? "best-row" : ""}>
              <td>{index + 1}</td>
              <td>
                {legResult.request.origin} → {legResult.request.destination}
                <br />
                {legResult.request.departureDate}
                {legResult.request.returnDate ? ` ~ ${legResult.request.returnDate}` : "（單程）"}
              </td>
              <td>
                {legResult.error && <span className="error-text">{legResult.error}</span>}
                {legResult.cheapest && formatPrice(legResult.cheapest.price, legResult.cheapest.currency)}
                {!legResult.error && !legResult.cheapest && "無資料"}
              </td>
              <td>
                {legResult.fastest && (
                  <>
                    {formatDuration(legResult.fastest.totalDurationMinutes)}
                    <br />
                    {formatPrice(legResult.fastest.price, legResult.fastest.currency)}
                  </>
                )}
                {!legResult.error && !legResult.fastest && "無資料"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
