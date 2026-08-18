import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { PanelShell } from "@/components/tkg/PanelShell";
import { OrderStatusSelect } from "@/components/tkg/OrderStatusSelect";
import { ShopManager } from "./admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { money, playChime, useStore } from "@/lib/tkg/store";

export const Route = createFileRoute("/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Panel — TKG Snacks" },
      { name: "description", content: "Shopkeeper dashboard for menu, stock and live orders." },
      { property: "og:title", content: "Vendor Panel — TKG Snacks" },
      { property: "og:description", content: "Manage your restaurant menu and incoming orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VendorPanel,
});

function VendorPanel() {
  const { db, session, update } = useStore();
  const shopId = session?.role === "vendor" ? session.shopId : "";
  const shop = db.shops.find((s) => s.id === shopId);
  const orders = db.orders.filter((o) => o.shopId === shopId);
  const seen = useRef<number | null>(null);

  const pending = orders.filter((o) => o.status === "Pending");
  const activeOrders = orders.filter((o) => o.status !== "Delivered");
  const historyOrders = orders.filter((o) => o.status === "Delivered");


  useEffect(() => {
    if (!shopId) return;
    if (seen.current === null) {
      seen.current = orders.length;
      return;
    }
    if (orders.length > seen.current) {
      playChime();
      toast.success("New order received!");
    }
    seen.current = orders.length;
  }, [orders.length, shopId]);

  const today = new Date().setHours(0, 0, 0, 0);
  const dailySales = orders
    .filter((o) => o.createdAt >= today && o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);

  return (
    <PanelShell title={shop?.name ?? "Vendor"} subtitle="Shopkeeper dashboard" allow="vendor">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Today's sales" value={money(dailySales)} />
        <Stat label="New orders" value={String(pending.length)} />
        <Stat
          label="Completed"
          value={String(orders.filter((o) => o.status === "Delivered").length)}
        />
        <Stat
          label="Out of stock"
          value={String(db.items.filter((i) => i.shopId === shopId && !i.inStock).length)}
        />
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Live orders</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="menu">Menu & stock</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-4 space-y-3">
          {activeOrders.length === 0 && (
            <p className="text-sm text-muted-foreground">No active orders.</p>
          )}
          {activeOrders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{o.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.customerName} · {o.phone} · {money(o.total)} COD
                  </p>
                  <p className="text-xs text-muted-foreground">{o.address}</p>
                </div>
                <OrderStatusSelect
                  value={o.status}
                  options={["Pending", "Preparing", "Ready for Pickup", "Cancelled"]}
                  onChange={(v) =>
                    update((d) => {
                      d.orders = d.orders.map((x) => (x.id === o.id ? { ...x, status: v } : x));
                      return d;
                    })
                  }
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {o.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")}
              </p>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <OrderHistory orders={historyOrders} />
        </TabsContent>

        <TabsContent value="menu" className="mt-4">
          {shopId && <ShopManager shopId={shopId} />}
        </TabsContent>
      </Tabs>
    </PanelShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-primary">{value}</p>
    </div>
  );
}
