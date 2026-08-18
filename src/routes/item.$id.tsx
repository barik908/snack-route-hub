import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money, useStore } from "@/lib/tkg/store";
import { useCart } from "@/lib/tkg/cart";
import type { Item } from "@/lib/tkg/types";

export const Route = createFileRoute("/item/$id")({
  head: () => ({
    meta: [
      { title: "Dish details — TKG Snacks" },
      {
        name: "description",
        content: "See dish price, ingredients, restaurant location and order with cash on delivery.",
      },
      { property: "og:title", content: "Dish details — TKG Snacks" },
      {
        property: "og:description",
        content: "Full dish details with pickup location, ingredients and instant ordering.",
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { db } = useStore();
  const { cart, setCart } = useCart();
  const navigate = useNavigate();

  const item = db.items.find((i) => i.id === id);
  const shop = item ? db.shops.find((s) => s.id === item.shopId) : undefined;

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Dish not found</h1>
        <Button asChild className="mt-4">
          <Link to="/">Back to menu</Link>
        </Button>
      </div>
    );
  }

  const cartShopId = cart.length ? db.items.find((i) => i.id === cart[0]!.itemId)?.shopId : undefined;

  const add = (it: Item) => {
    if (!it.inStock) return false;
    if (cart.length && cartShopId && cartShopId !== it.shopId) {
      toast.error("One order per restaurant. Clear your cart to order from another shop.");
      return false;
    }
    setCart((prev) => {
      const found = prev.find((l) => l.itemId === it.id);
      if (found) return prev.map((l) => (l.itemId === it.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { itemId: it.id, name: it.name, price: it.price, qty: 1 }];
    });
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Button size="icon" variant="secondary" asChild>
            <Link to="/" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="truncate text-base font-bold">{item.name}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5">
        <div className="grid gap-6 md:grid-cols-2">
          <img
            src={item.image}
            alt={item.name}
            className="h-64 w-full rounded-2xl object-cover md:h-80"
          />
          <div className="space-y-4">
            <div>
              <p className="text-sm text-accent">{shop?.name}</p>
              <h2 className="text-2xl font-extrabold">{item.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-primary text-primary" />
                {item.rating}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold">Location</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {shop?.address ?? db.settings.location}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold">Ingredients</p>
              <p className="text-sm text-muted-foreground">{item.ingredients}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">{money(item.price)}</span>
              <Badge variant={item.inStock ? "default" : "secondary"}>
                {item.inStock ? "In stock" : "Out of stock"}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={!item.inStock}
                onClick={() => {
                  if (add(item)) toast.success(`${item.name} added to cart`);
                }}
              >
                Add to Cart
              </Button>
              <Button
                className="flex-1"
                disabled={!item.inStock}
                onClick={() => {
                  if (add(item)) void navigate({ to: "/", search: { checkout: true } });
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
