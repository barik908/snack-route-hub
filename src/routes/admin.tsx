import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Plus, Trash2 } from "lucide-react";
import { PanelShell } from "@/components/tkg/PanelShell";
import { OrderStatusSelect } from "@/components/tkg/OrderStatusSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money, useStore } from "@/lib/tkg/store";
import type { Item, Order } from "@/lib/tkg/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Master Control — TKG Snacks Admin" },
      { name: "description", content: "Super admin control panel for TKG Snacks operations." },
      { property: "og:title", content: "Master Control — TKG Snacks Admin" },
      { property: "og:description", content: "Manage shops, riders, categories and live orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPanel,
});

const uid = () => Math.random().toString(36).slice(2, 9);

function AdminPanel() {
  const { db, update } = useStore();
  const [shopMode, setShopMode] = useState<string | null>(null);

  const revenue = db.orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);
  const active = db.orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled",
  ).length;
  const delivered = db.orders.filter((o) => o.status === "Delivered").length;
  const activeOrders = db.orders.filter((o) => o.status !== "Delivered");
  const historyOrders = db.orders.filter((o) => o.status === "Delivered");


  if (shopMode) {
    const shop = db.shops.find((s) => s.id === shopMode);
    if (!shop) return null;
    return (
      <PanelShell title={`Shop mode · ${shop.name}`} subtitle="Direct store management" allow="admin">
        <Button variant="secondary" size="sm" className="mb-4" onClick={() => setShopMode(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to stores
        </Button>
        <ShopManager shopId={shop.id} />
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Super Admin · Master Control" subtitle={db.settings.siteName} allow="admin">
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total revenue" value={money(revenue)} />
        <Stat label="Active orders" value={String(active)} />
        <Stat label="Delivered" value={String(delivered)} />
        <Stat label="Shops" value={String(db.shops.length)} />
      </div>

      <Tabs defaultValue="stores">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="riders">Riders</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>


        <TabsContent value="stores" className="mt-4 space-y-4">
          <AddShop />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {db.shops.map((shop) => {
              const count = db.items.filter((i) => i.shopId === shop.id).length;
              return (
                <div
                  key={shop.id}
                  className="rounded-xl border border-border bg-card p-3 transition hover:border-primary/60"
                >
                  <button
                    className="flex w-full gap-3 text-left"
                    onClick={() => setShopMode(shop.id)}
                  >
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">{shop.ownerPhone}</p>
                      <p className="truncate text-xs text-muted-foreground">{shop.address}</p>
                      <div className="mt-1 flex gap-2">
                        <Badge variant="secondary">{count} items</Badge>
                        <Badge variant={shop.active ? "default" : "destructive"}>
                          {shop.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </button>
                  <div className="mt-3 flex items-center gap-2">
                    <Switch
                      checked={shop.active}
                      onCheckedChange={(v) =>
                        update((d) => {
                          d.shops = d.shops.map((s) => (s.id === shop.id ? { ...s, active: v } : s));
                          return d;
                        })
                      }
                    />
                    <span className="text-xs text-muted-foreground">Active</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => {
                        const pw = prompt(`New password for ${shop.name}`);
                        if (!pw) return;
                        update((d) => {
                          d.shops = d.shops.map((s) =>
                            s.id === shop.id ? { ...s, password: pw } : s,
                          );
                          return d;
                        });
                        toast.success("Vendor password reset");
                      }}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        update((d) => {
                          d.shops = d.shops.filter((s) => s.id !== shop.id);
                          d.items = d.items.filter((i) => i.shopId !== shop.id);
                          return d;
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4 space-y-3">
          {activeOrders.length === 0 && (
            <p className="text-sm text-muted-foreground">No active orders.</p>
          )}
          {activeOrders.map((o) => (
            <AdminOrderCard key={o.id} order={o} />
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          <OrderHistory orders={historyOrders} />
        </TabsContent>

        <TabsContent value="riders" className="mt-4 space-y-4">
          <AddRider />
          <div className="grid gap-3 sm:grid-cols-2">
            {db.riders.map((r) => (
              <RiderCard key={r.id} rider={r} />
            ))}
          </div>
        </TabsContent>


        <TabsContent value="categories" className="mt-4 space-y-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              const name = String(data.get("name")).trim();
              if (!name) return;
              update((d) => {
                d.categories.push({ id: uid(), name });
                return d;
              });
              form.reset();
            }}
          >
            <Input name="name" placeholder="New category name" />
            <Button type="submit">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <div className="space-y-2">
            {db.categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
              >
                <Input
                  value={c.name}
                  onChange={(e) =>
                    update((d) => {
                      d.categories = d.categories.map((x) =>
                        x.id === c.id ? { ...x, name: e.target.value } : x,
                      );
                      return d;
                    })
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    update((d) => {
                      d.categories = d.categories.filter((x) => x.id !== c.id);
                      return d;
                    })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingField label="Website name" value={db.settings.siteName} k="siteName" />
            <SettingField label="Brand logo URL" value={db.settings.logoUrl} k="logoUrl" />
            <SettingField label="Contact phone" value={db.settings.phone} k="phone" />
            <SettingField label="Default location" value={db.settings.location} k="location" />
            <SettingField
              label="Delivery charge"
              value={String(db.settings.deliveryCharge)}
              k="deliveryCharge"
              numeric
            />
            <SettingField
              label="Admin password"
              value={db.settings.adminPassword}
              k="adminPassword"
            />
          </div>
        </TabsContent>
      </Tabs>
    </PanelShell>
  );
}

function SettingField({
  label,
  value,
  k,
  numeric,
}: {
  label: string;
  value: string;
  k: keyof import("@/lib/tkg/types").Settings;
  numeric?: boolean;
}) {
  const { update } = useStore();
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) =>
          update((d) => {
            const v = numeric ? Number(e.target.value || 0) : e.target.value;
            d.settings = { ...d.settings, [k]: v };
            return d;
          })
        }
      />
    </div>
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

function AddShop() {
  const { update } = useStore();
  return (
    <form
      className="grid gap-2 rounded-xl border border-border bg-card p-3 sm:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        update((d) => {
          d.shops.push({
            id: uid(),
            name: String(f.get("name")),
            logo: String(f.get("logo")) || "https://placehold.co/200x200?text=Shop",
            ownerPhone: String(f.get("phone")),
            address: String(f.get("address")),
            password: String(f.get("password")),
            active: true,
          });
          return d;
        });
        form.reset();
        toast.success("Shop registered");
      }}
    >
      <Input name="name" placeholder="Shop name" required />
      <Input name="phone" placeholder="Owner phone" required />
      <Input name="address" placeholder="Address" required />
      <Input name="logo" placeholder="Logo URL" />
      <div className="flex gap-2">
        <Input name="password" placeholder="Password" required />
        <Button type="submit">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function AddRider() {
  const { update } = useStore();
  return (
    <form
      className="grid gap-2 rounded-xl border border-border bg-card p-3 sm:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        update((d) => {
          d.riders.push({
            id: uid(),
            name: String(f.get("name")),
            phone: String(f.get("phone")),
            vehicle: String(f.get("vehicle")),
            license: String(f.get("license")),
            password: String(f.get("password")),
            status: "Offline",
          });
          return d;
        });
        form.reset();
        toast.success("Rider added");
      }}
    >
      <Input name="name" placeholder="Rider name" required />
      <Input name="phone" placeholder="Phone" required />
      <Input name="vehicle" placeholder="Vehicle" required />
      <Input name="license" placeholder="License / ID" />
      <div className="flex gap-2">
        <Input name="password" placeholder="Password" required />
        <Button type="submit">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function AdminOrderCard({ order }: { order: Order }) {
  const { db, update } = useStore();
  const shop = db.shops.find((s) => s.id === order.shopId);
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">
            {order.id} · {shop?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.customerName} · {order.phone} · {money(order.total)} COD
          </p>
          <p className="text-xs text-muted-foreground">{order.address}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusSelect
            value={order.status}
            onChange={(v) =>
              update((d) => {
                d.orders = d.orders.map((o) => (o.id === order.id ? { ...o, status: v } : o));
                return d;
              })
            }
          />
          <Select
            value={order.riderId ?? "none"}
            onValueChange={(v) =>
              update((d) => {
                d.orders = d.orders.map((o) =>
                  o.id === order.id
                    ? {
                        ...o,
                        riderId: v === "none" ? null : v,
                        status: v === "none" ? o.status : "Assigned to Rider",
                      }
                    : o,
                );
                return d;
              })
            }
          >
            <SelectTrigger className="h-8 w-[170px] text-xs">
              <SelectValue placeholder="Assign rider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">
                Unassigned
              </SelectItem>
              {db.riders.map((r) => (
                <SelectItem key={r.id} value={r.id} className="text-xs">
                  {r.name} ({r.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {order.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")}
      </p>
    </div>
  );
}

export function ShopManager({ shopId }: { shopId: string }) {
  const { db, update } = useStore();
  const items = db.items.filter((i) => i.shopId === shopId);
  const orders = db.orders.filter((o) => o.shopId === shopId);
  const sales = orders
    .filter((o) => o.status === "Delivered")
    .reduce((s, o) => s + o.total, 0);

  const patch = (id: string, p: Partial<Item>) =>
    update((d) => {
      d.items = d.items.map((i) => (i.id === id ? { ...i, ...p } : i));
      return d;
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Menu items" value={String(items.length)} />
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Delivered sales" value={money(sales)} />
      </div>

      <form
        className="grid gap-2 rounded-xl border border-border bg-card p-3 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          update((d) => {
            d.items.push({
              id: uid(),
              shopId,
              categoryId: String(f.get("categoryId")),
              name: String(f.get("name")),
              description: String(f.get("description")),
              ingredients: String(f.get("ingredients")),
              price: Number(f.get("price")),
              image: String(f.get("image")) || "https://placehold.co/600x400?text=Food",
              inStock: true,
              rating: 4.5,
            });
            return d;
          });
          form.reset();
          toast.success("Item added");
        }}
      >
        <Input name="name" placeholder="Item name" required />
        <Input name="price" type="number" placeholder="Price" required />
        <select
          name="categoryId"
          required
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {db.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Input name="image" placeholder="Image URL" />
        <Input name="description" placeholder="Description" />
        <div className="flex gap-2">
          <Input name="ingredients" placeholder="Ingredients" />
          <Button type="submit">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
            <div className="min-w-[140px] flex-1">
              <Input
                value={i.name}
                onChange={(e) => patch(i.id, { name: e.target.value })}
                className="h-8"
              />
            </div>
            <Input
              type="number"
              value={i.price}
              onChange={(e) => patch(i.id, { price: Number(e.target.value) })}
              className="h-8 w-24"
            />
            <div className="flex items-center gap-2">
              <Switch checked={i.inStock} onCheckedChange={(v) => patch(i.id, { inStock: v })} />
              <span className="text-xs text-muted-foreground">
                {i.inStock ? "In stock" : "Out of stock"}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                update((d) => {
                  d.items = d.items.filter((x) => x.id !== i.id);
                  return d;
                })
              }
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Store order history</h3>
        {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="rounded-lg border border-border bg-card p-2 text-sm">
            {o.id} · {o.customerName} · {money(o.total)} ·{" "}
            <span className="text-primary">{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
