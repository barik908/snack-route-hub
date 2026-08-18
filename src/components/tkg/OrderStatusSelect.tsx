import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/lib/tkg/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Preparing",
  "Ready for Pickup",
  "Assigned to Rider",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export function OrderStatusSelect({
  value,
  onChange,
  options = ORDER_STATUSES,
}: {
  value: OrderStatus;
  onChange: (v: OrderStatus) => void;
  options?: OrderStatus[];
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as OrderStatus)}>
      <SelectTrigger className="h-8 w-[180px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
