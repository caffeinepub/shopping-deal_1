import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";
import { useAppContext } from "../context/AppContext";
import { useAllOrders, useUpdateOrderStatus } from "../hooks/useQueries";

const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
    [OrderStatus.pending]: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    [OrderStatus.confirmed]: {
      label: "Confirmed",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    [OrderStatus.delivered]: {
      label: "Delivered",
      className: "bg-green-100 text-green-800 border-green-200",
    },
  };

export default function AdminOrdersPage() {
  const { navigate, isAdmin } = useAppContext();
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();

  if (!isAdmin) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Access denied. Admin only.</p>
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="pb-6">
      <div className="px-4 py-4 border-b border-border flex items-center gap-2">
        <button
          type="button"
          data-ocid="admin_orders.back_button"
          onClick={() => navigate("home")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Admin Orders Panel</h1>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }, (_, i) => `sk-${i}`).map((key) => (
            <Skeleton key={key} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (orders ?? []).length === 0 ? (
        <div className="py-16 text-center" data-ocid="admin_orders.empty_state">
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="p-4 space-y-3" data-ocid="admin_orders.table">
          {(orders ?? []).map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-4"
              data-ocid={`admin_orders.item.${i + 1}`}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Order ID: {order.id.slice(0, 8)}...
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.customerEmail}
                  </p>
                </div>
                <Badge
                  className={`text-xs border flex-shrink-0 ${statusConfig[order.status].className}`}
                >
                  {statusConfig[order.status].label}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 mb-3">
                <p>📦 {order.items.length} items</p>
                <p>📍 {order.deliveryAddress}</p>
                <p>💳 {order.paymentMethod}</p>
                <p className="font-semibold text-foreground">
                  Total: ₹{order.totalAmount.toString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Update Status:</span>
                <Select
                  value={order.status}
                  onValueChange={(v) =>
                    handleStatusChange(order.id, v as OrderStatus)
                  }
                >
                  <SelectTrigger
                    data-ocid={`admin_orders.status_select.${i + 1}`}
                    className="h-8 text-xs flex-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
                    <SelectItem value={OrderStatus.confirmed}>
                      Confirmed
                    </SelectItem>
                    <SelectItem value={OrderStatus.delivered}>
                      Delivered
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
