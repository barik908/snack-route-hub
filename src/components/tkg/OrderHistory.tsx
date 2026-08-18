import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { money, useStore } from "@/lib/tkg/store";
import type { Order } from "@/lib/tkg/types";

export function OrderHistory({ orders }: { orders: Order[] }) {
  const { db } = useStore();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) => {
      const shop = db.shops.find((x) => x.id === o.shopId)?.name ?? "";
      const rider = db.riders.find((r) => r.id === o.riderId)?.name ?? "";
      return [
        o.id,
        o.customerName,
        o.phone,
        o.phone2,
        o.address,
        o.landmark,
        shop,
        rider,
        o.lines.map((l) => l.name).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(s);
    });
  }, [orders, q, db.shops, db.riders]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search history by order ID, customer, phone, address or item…"
          className="pl-9"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No delivered orders found.</p>
      ) : (
        filtered.map((o) => {
          const shop = db.shops.find((x) => x.id === o.shopId);
          const rider = db.riders.find((r) => r.id === o.riderId);
          return (
            <div key={o.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {o.id}
                    {shop ? ` · ${shop.name}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.customerName} · {o.phone} · {money(o.total)} COD
                  </p>
                  <p className="text-xs text-muted-foreground">{o.address}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{new Date(o.createdAt).toLocaleString()}</p>
                  {rider && <p>Rider: {rider.name}</p>}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {o.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
