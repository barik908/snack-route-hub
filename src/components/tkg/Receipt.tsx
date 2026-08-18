import { money } from "@/lib/tkg/store";
import type { Order, Settings, Shop } from "@/lib/tkg/types";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export function receiptText(order: Order, shop: Shop | undefined, settings: Settings) {
  const lines = order.lines
    .map((l) => `${l.qty} x ${l.name} .......... ${money(l.price * l.qty)}`)
    .join("\n");
  return `${settings.siteName} — CASH MEMO
Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleString()}
Shop: ${shop?.name ?? "-"}
Customer: ${order.customerName}
Phone: ${order.phone}${order.phone2 ? " / " + order.phone2 : ""}
Address: ${order.address}
Landmark: ${order.landmark || "-"}

${lines}

Subtotal: ${money(order.subtotal)}
Delivery: ${money(order.delivery)}
TOTAL (COD): ${money(order.total)}

Please pay ${money(order.total)} in cash to the delivery rider.
Support: ${settings.phone} | ${settings.location}`;
}

export function Receipt({
  order,
  shop,
  settings,
}: {
  order: Order;
  shop: Shop | undefined;
  settings: Settings;
}) {
  const download = () => {
    const text = receiptText(order, shop, settings);
    const lines = text.split("\n");
    const scale = 2;
    const padding = 24;
    const lineHeight = 20;
    const width = 460;
    const height = padding * 2 + lines.length * lineHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#111111";
    ctx.textBaseline = "top";
    lines.forEach((line, i) => {
      ctx.font = i === 0 ? "bold 16px monospace" : "13px monospace";
      ctx.fillText(line, padding, padding + i * lineHeight);
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${order.id}-cash-memo.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };


  return (
    <div className="space-y-4">
      <div
        id="print-area"
        className="rounded-xl border border-dashed border-border bg-secondary/40 p-4 font-mono text-xs"
      >
        <p className="text-center text-base font-bold tracking-wide">{settings.siteName}</p>
        <p className="text-center text-muted-foreground">
          {settings.location} · {settings.phone}
        </p>
        <p className="my-3 text-center">— CASH MEMO —</p>
        <div className="space-y-0.5">
          <p>Order ID: {order.id}</p>
          <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
          <p>Shop: {shop?.name ?? "-"}</p>
          <p>Customer: {order.customerName}</p>
          <p>
            Phone: {order.phone}
            {order.phone2 ? ` / ${order.phone2}` : ""}
          </p>
          <p>Address: {order.address}</p>
          <p>Landmark: {order.landmark || "-"}</p>
        </div>
        <div className="my-3 border-t border-dashed border-border pt-3">
          {order.lines.map((l) => (
            <div key={l.itemId} className="flex justify-between">
              <span>
                {l.qty} x {l.name}
              </span>
              <span>{money(l.price * l.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-border pt-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{money(order.delivery)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm font-bold">
            <span>TOTAL (COD)</span>
            <span>{money(order.total)}</span>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Please pay {money(order.total)} in cash on delivery. Thank you!
        </p>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
        <Button variant="secondary" className="flex-1" onClick={download}>
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}
