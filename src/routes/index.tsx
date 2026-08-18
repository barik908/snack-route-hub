import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lock, Store, Bike, Search, ShoppingCart, Star, Plus, Minus, Phone, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { money, useStore } from "@/lib/tkg/store";
import type { Item, Order } from "@/lib/tkg/types";
import { useCart } from "@/lib/tkg/cart";
import { LoginModals, type PanelKind } from "@/components/tkg/LoginModals";
import { Receipt } from "@/components/tkg/Receipt";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TKG Snacks — Food Delivery in Thakurgaon" },
      {
        name: "description",
        content:
          "Order burgers, biryani, pizza, bakery and snacks from the best restaurants in Thakurgaon. Fast cash-on-delivery service by TKG Snacks.",
      },
      { property: "og:title", content: "TKG Snacks — Food Delivery in Thakurgaon" },
      {
        property: "og:description",
        content:
          "Multi-restaurant food delivery in Thakurgaon. Live search, instant cash memo and doorstep delivery.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { checkout?: boolean } =>
    search["checkout"] === "1" || search["checkout"] === true ? { checkout: true } : {},
  component: Storefront,
});

function Storefront() {
  const { db, placeOrder } = useStore();
  const { cart, setCart, clear } = useCart();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { settings, categories, shops, items } = db;

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [shopFilter, setShopFilter] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [panel, setPanel] = useState<PanelKind>(null);

  const shopName = (id: string) => shops.find((s) => s.id === id)?.name ?? "";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const shop = shops.find((s) => s.id === i.shopId);
      if (!shop?.active) return false;
      if (cat !== "all" && i.categoryId !== cat) return false;
      if (shopFilter !== "all" && i.shopId !== shopFilter) return false;
      if (!q) return true;
      const catName = categories.find((c) => c.id === i.categoryId)?.name ?? "";
      return (
        i.name.toLowerCase().includes(q) ||
        catName.toLowerCase().includes(q) ||
        shop.name.toLowerCase().includes(q)
      );
    });
  }, [items, shops, categories, query, cat, shopFilter]);

  const cartShopId = cart.length ? items.find((i) => i.id === cart[0]!.itemId)?.shopId : undefined;
  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const total = subtotal + (cart.length ? settings.deliveryCharge : 0);

  useEffect(() => {
    if (search.checkout && cart.length) {
      setCheckout(true);
      void navigate({ to: "/", search: {}, replace: true });
    }
  }, [search.checkout, cart.length, navigate]);

  const addToCart = (item: Item) => {
    if (!item.inStock) return;
    if (cart.length && cartShopId && cartShopId !== item.shopId) {
      toast.error("One order per restaurant. Clear your cart to order from another shop.");
      return;
    }
    setCart((prev) => {
      const found = prev.find((l) => l.itemId === item.id);
      if (found)
        return prev.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { itemId: item.id, name: item.name, price: item.price, qty: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const setQty = (itemId: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );

  const submitOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const order = placeOrder({
      shopId: cartShopId!,
      lines: cart,
      customerName: String(f.get("name")),
      phone: String(f.get("phone")),
      phone2: String(f.get("phone2") ?? ""),
      address: String(f.get("address")),
      landmark: String(f.get("landmark") ?? ""),
      subtotal,
      delivery: settings.deliveryCharge,
      total,
    });
    clear();
    setCheckout(false);
    setCartOpen(false);
    setPlaced(order);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-lg brand-gradient text-lg">
                  🍔
                </div>
              )}
              <div>
                <h1 className="text-lg leading-tight font-extrabold brand-text">
                  {settings.siteName}
                </h1>
                <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Phone className="h-3 w-3" /> {settings.phone}
                  <MapPin className="h-3 w-3" /> {settings.location}
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => setCartOpen(true)} className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                  {cart.reduce((s, l) => s + l.qty, 0)}
                </span>
              )}
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food, category or restaurant…"
              className="pl-9"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <CatChip active={cat === "all"} onClick={() => setCat("all")} label="All" />
            {categories.map((c) => (
              <CatChip
                key={c.id}
                active={cat === c.id}
                onClick={() => setCat(c.id)}
                label={c.name}
              />
            ))}
          </div>
        </div>
      </header>


      <section className="mx-auto max-w-6xl px-4 py-5">
        <div className="mb-5 overflow-hidden rounded-2xl brand-gradient p-5 glow">
          <p className="mt-1 text-sm text-primary-foreground/80">
            {shops.filter((s) => s.active).length} restaurants · {items.length} dishes · Cash on
            delivery
          </p>
        </div>

        {visible.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No items match your search.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {visible.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/60"
              >
                <Link
                  to="/item/$id"
                  params={{ id: item.id }}
                  className="block w-full text-left"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-28 w-full object-cover transition group-hover:scale-105 sm:h-40"
                  />
                  <div className="p-3">
                    <p className="truncate text-[11px] text-accent">{shopName(item.shopId)}</p>
                    <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-bold text-primary">{money(item.price)}</span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        {item.rating}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="px-3 pb-3">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!item.inStock}
                    onClick={() => addToCart(item)}
                  >
                    {item.inStock ? "Add to cart" : "Out of stock"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-8 border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">{settings.siteName}</p>
            <p className="text-xs">
              {settings.location} · Hotline {settings.phone}
            </p>
            <p className="mt-1 text-xs">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="flex items-center gap-3 opacity-40 transition hover:opacity-100">
            <button aria-label="Admin" onClick={() => setPanel("admin")} className="p-1">
              <Lock className="h-4 w-4" />
            </button>
            <button aria-label="Vendor" onClick={() => setPanel("vendor")} className="p-1">
              <Store className="h-4 w-4" />
            </button>
            <button aria-label="Rider" onClick={() => setPanel("rider")} className="p-1">
              <Bike className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>

      <LoginModals open={panel} onOpenChange={setPanel} />

      {/* Cart */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your cart</DialogTitle>
            <DialogDescription>
              {cartShopId ? shopName(cartShopId) : "Cart is empty"}
            </DialogDescription>
          </DialogHeader>
          {cart.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <>
              <div className="space-y-2">
                {cart.map((l) => (
                  <div
                    key={l.itemId}
                    className="flex items-center justify-between rounded-lg border border-border p-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{money(l.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setQty(l.itemId, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{l.qty}</span>
                      <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setQty(l.itemId, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1 border-t border-border pt-3 text-sm">
                <Row label="Subtotal" value={money(subtotal)} />
                <Row label="Delivery" value={money(settings.deliveryCharge)} />
                <Row label="Total (COD)" value={money(total)} bold />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => clear()}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button className="flex-1" onClick={() => setCheckout(true)}>
                  Checkout
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout */}
      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delivery details</DialogTitle>
            <DialogDescription>Pay {money(total)} cash on delivery.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitOrder} className="space-y-3">
            <Field name="name" label="Full name" required />
            <Field name="phone" label="Primary phone" required />
            <Field name="phone2" label="Secondary phone (optional)" />
            <div className="space-y-1.5">
              <Label htmlFor="address">Delivery address</Label>
              <Textarea id="address" name="address" required />
            </div>
            <Field name="landmark" label="Nearby landmark" />
            <Button type="submit" className="w-full">
              Confirm order · {money(total)}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt */}
      <Dialog open={placed !== null} onOpenChange={(v) => !v && setPlaced(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order confirmed 🎉</DialogTitle>
            <DialogDescription>Your cash memo is ready.</DialogDescription>
          </DialogHeader>
          {placed && (
            <Receipt
              order={placed}
              shop={shops.find((s) => s.id === placed.shopId)}
              settings={settings}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required={required} />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-primary" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function CatChip({
  label,
  active,
  onClick,
  subtle,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-transparent brand-gradient text-primary-foreground"
          : subtle
            ? "border-border bg-secondary/40 text-muted-foreground"
            : "border-border bg-secondary text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
