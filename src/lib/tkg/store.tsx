import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedDB } from "./seed";
import type { DB, Order } from "./types";

const KEY = "tkg-snacks-db-v1";
const SESSION_KEY = "tkg-snacks-session-v1";

export type Session =
  | { role: "admin" }
  | { role: "vendor"; shopId: string }
  | { role: "rider"; riderId: string }
  | null;

interface Ctx {
  db: DB;
  ready: boolean;
  update: (fn: (draft: DB) => DB) => void;
  session: Session;
  setSession: (s: Session) => void;
  loginAdmin: (password: string) => boolean;
  loginVendor: (phoneOrId: string, password: string) => boolean;
  loginRider: (phoneOrId: string, password: string) => boolean;
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "status" | "riderId">) => Order;
}

const StoreContext = createContext<Ctx | null>(null);

function load(): DB | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DB) : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => seedDB());
  const [ready, setReady] = useState(false);
  const [session, setSessionState] = useState<Session>(null);

  useEffect(() => {
    const loaded = load();
    if (loaded) setDb(loaded);
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setSessionState(JSON.parse(s) as Session);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(db));
  }, [db, ready]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setDb(JSON.parse(e.newValue) as DB);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setSession = useCallback((s: Session) => {
    setSessionState(s);
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  }, []);

  const update = useCallback((fn: (draft: DB) => DB) => {
    setDb((prev) => fn(structuredClone(prev)));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      db,
      ready,
      update,
      session,
      setSession,
      loginAdmin: (password) => {
        const ok = password === db.settings.adminPassword;
        if (ok) setSession({ role: "admin" });
        return ok;
      },
      loginVendor: (phoneOrId, password) => {
        const shop = db.shops.find(
          (s) => s.ownerPhone === phoneOrId.trim() || s.id === phoneOrId.trim(),
        );
        if (!shop || shop.password !== password) return false;
        setSession({ role: "vendor", shopId: shop.id });
        return true;
      },
      loginRider: (phoneOrId, password) => {
        const rider = db.riders.find(
          (r) => r.phone === phoneOrId.trim() || r.id === phoneOrId.trim(),
        );
        if (!rider || rider.password !== password) return false;
        setSession({ role: "rider", riderId: rider.id });
        return true;
      },
      placeOrder: (o) => {
        const order: Order = {
          ...o,
          id: `TKG-${Date.now().toString().slice(-6)}`,
          status: "Pending",
          riderId: null,
          createdAt: Date.now(),
        };
        setDb((prev) => ({ ...prev, orders: [order, ...prev.orders] }));
        return order;
      },
    }),
    [db, ready, update, session, setSession],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function money(n: number) {
  return `৳${n.toFixed(0)}`;
}

export function playChime() {
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    [880, 1240].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.22 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.22 + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.22);
      osc.stop(ctx.currentTime + i * 0.22 + 0.22);
    });
  } catch {
    /* audio unavailable */
  }
}
