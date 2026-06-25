import type { Holder } from "@/types";

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(
    amount
  );
}

function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}

/**
 * Top-holders table for the trade page's "Holders" tab. Ranked by the order
 * `holders` is provided in (the API is expected to return them sorted by
 * size already).
 */
export function HoldersTable({ holders }: { holders: Holder[] }) {
  if (holders.length === 0) {
    return <p className="p-4 text-sm cw-text-muted">No holder data available</p>;
  }

  return (
    <table className="cw-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Owner</th>
          <th>Amount</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>
        {holders.map((holder, index) => (
          <tr key={holder.owner}>
            <td className="cw-num text-muted">{index + 1}</td>
            <td className="cw-num text-foreground">{truncateAddress(holder.owner)}</td>
            <td className="cw-num text-foreground">{formatAmount(holder.amount)}</td>
            <td className="cw-num text-muted">{formatPercentage(holder.percentage)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
