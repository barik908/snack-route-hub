import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Map, Phone } from "lucide-react";
import { toast } from "sonner";
import { PanelShell } from "@/components/tkg/PanelShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money, useStore } from "@/lib/tkg/store";
import type { RiderStatus } from "@/lib/tkg/types";

export const Route = createFileRoute("/rider")({
  head: () => ({
    meta: [
      { title: "Rider Panel — TKG Snacks" },
      { name: "description", content: "Delivery rider dashboard with assigned orders and navigation." },
      { property: "og:title", content: "Rider Panel — TKG Snacks" },
      { property: "og:description", content: "Track assigned deliveries, COD amounts and navigation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RiderPanel,
});

function RiderPanel() {
  const { db, session, update } = useStore();
  const riderId = session?.role === "rider" ? session.riderId : "";
  const rider = db.riders.find((r) => r.id === riderId);
  const orders = db.orders.filter((o) => o.riderId === riderId);
  const activeOrders = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
  const cash = orders
    .filter((o) => o.status === "Delivered")
    .reduce((s, o) => s + o.total, 0);

  return (
    <PanelShell title={rider?.name ?? "Rider"} subtitle="Delivery dashboard" allow="rider">
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="Status" value={rider?.status ?? "-"} />
        <Stat label="Active tasks" value={String(activeOrders.length)} />
        <Stat label="Cash collected" value={money(cash)} />
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <span className="text-sm">Availability</span>
        <Select
          value={rider?.status ?? "Offline"}
          onValueChange={(v) =>
            update((d) => {
              d.riders = d.riders.map((r) =>
                r.id === riderId ? { ...r, status: v as RiderStatus } : r,
              );
              return d;
            })
          }
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Delivery">On Delivery</SelectItem>
            <SelectItem value="Offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {orders.length === 0 && (
          <p className="text-sm text-muted-foreground">No deliveries assigned to you yet.</p>
        )}
        {orders.map((o) => {
          const shop = db.shops.find((s) => s.id === o.shopId);
          return (
            <div key={o.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{o.id}</p>
                <Badge variant={o.status === "Delivered" ? "secondary" : "default"}>
                  {o.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Pickup: {shop?.name}</p>
              <div className="mt-2 space-y-0.5 text-sm">
                <p className="font-medium">{o.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {o.phone}
                  {o.phone2 ? ` / ${o.phone2}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.address}
                  {o.landmark ? ` (near ${o.landmark})` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")}
                </p>
                <p className="font-bold text-primary">Collect {money(o.total)} cash</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" asChild>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${o.address} ${o.landmark} ${db.settings.location}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Map className="mr-2 h-4 w-4" /> Navigate
                  </a>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <a href={`tel:${o.phone}`}>
                    <Phone className="mr-2 h-4 w-4" /> Call
                  </a>
                </Button>
                {o.status !== "Delivered" && (
                  <>
                    {o.status !== "Out for Delivery" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          update((d) => {
                            d.orders = d.orders.map((x) =>
                              x.id === o.id ? { ...x, status: "Out for Delivery" } : x,
                            );
                            d.riders = d.riders.map((r) =>
                              r.id === riderId ? { ...r, status: "On Delivery" } : r,
                            );
                            return d;
                          })
                        }
                      >
                        Start delivery
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        update((d) => {
                          d.orders = d.orders.map((x) =>
                            x.id === o.id ? { ...x, status: "Delivered" } : x,
                          );
                          return d;
                        });
                        toast.success("Marked as delivered");
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Mark delivered
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PanelShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-bold text-primary">{value}</p>
    </div>
  );
}
