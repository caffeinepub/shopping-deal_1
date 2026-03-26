import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Package } from "lucide-react";
import { motion } from "motion/react";
import { OrderStatus } from "../backend";
import { useAppContext } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllOrders } from "../hooks/useQueries";

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

export default function MyOrdersPage() {
  const { navigate } = useAppContext();
  const { identity } = useInternetIdentity();
  const { data: allOrders, isLoading } = useAllOrders();

  const myPrincipal = identity?.getPrincipal().toString();
  const myOrders = (allOrders ?? []).filter(
    (o) => o.customerId.toString() === myPrincipal,
  );

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="font-display text-lg font-semibold mb-2">
          Sign in to view orders
        </h2>
        <Button
          data-ocid="my_orders.sign_in_button"
          onClick={() => navigate("sign-in")}
          className="bg-primary text-primary-foreground"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="px-4 py-4 border-b border-border flex items-center gap-2">
        <button
          type="button"
          data-ocid="my_orders.back_button"
          onClick={() => navigate("home")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-bold">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }, (_, i) => `sk-${i}`).map((key) => (
            <Skeleton key={key} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : myOrders.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="my_orders.empty_state"
        >
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">
            No orders yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Your placed orders will appear here.
          </p>
          <Button
            data-ocid="my_orders.shop_now_button"
            onClick={() => navigate("home")}
            className="mt-4 bg-primary text-primary-foreground"
          >
            Shop Now
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-3" data-ocid="my_orders.list">
          {myOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4"
              data-ocid={`my_orders.item.${i + 1}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="text-sm font-mono font-semibold">
                    {order.id.slice(0, 8)}...
                  </p>
                </div>
                <Badge
                  className={`text-xs font-semibold border ${statusConfig[order.status].className}`}
                >
                  {statusConfig[order.status].label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·
                {new Date(
                  Number(order.createdAt / 1_000_000n),
                ).toLocaleDateString("en-IN")}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
                  📍 {order.deliveryAddress}
                </p>
                <p className="font-bold text-primary ml-2">
                  ₹{order.totalAmount.toString()}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                💳 {order.paymentMethod}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
