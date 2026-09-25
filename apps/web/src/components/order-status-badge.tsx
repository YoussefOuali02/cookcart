import type { OrderStatus } from "@/types/api";

const STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  PREPARING: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  READY: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  CANCELLED: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
