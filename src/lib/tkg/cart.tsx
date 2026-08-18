import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { OrderLine } from "./types";

const CART_KEY = "tkg-snacks-cart-v1";

interface CartCtx {
  cart: OrderLine[];
  setCart: (lines: OrderLine[] | ((prev: OrderLine[]) => OrderLine[])) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCartState] = useState<OrderLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setCartState(JSON.parse(raw) as OrderLine[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  const setCart = useCallback(
    (lines: OrderLine[] | ((prev: OrderLine[]) => OrderLine[])) => setCartState(lines),
    [],
  );

  const value = useMemo<CartCtx>(
    () => ({ cart, setCart, clear: () => setCartState([]) }),
    [cart, setCart],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
