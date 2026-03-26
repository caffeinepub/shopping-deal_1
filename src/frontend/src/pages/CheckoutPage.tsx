import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronLeft, Loader2, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";
import { useAppContext } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, usePlaceOrder } from "../hooks/useQueries";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, navigate } = useAppContext();
  const { identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const placeOrder = usePlaceOrder();
  const [address, setAddress] = useState("");
  const [ordered, setOrdered] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Please sign in to place an order");
      navigate("sign-in");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    try {
      await placeOrder.mutateAsync({
        id: crypto.randomUUID(),
        customerName: profile?.name ?? "Customer",
        customerEmail: profile?.email ?? "",
        customerId: identity.getPrincipal(),
        status: OrderStatus.pending,
        deliveryAddress: address.trim(),
        paymentMethod: "Cash on Delivery",
        createdAt: BigInt(Date.now()) * 1_000_000n,
        totalAmount: cartTotal,
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: BigInt(item.quantity),
          price: item.price,
        })),
      });
      clearCart();
      setOrdered(true);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (ordered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
        data-ocid="checkout.success_state"
      >
        <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Order Placed!</h2>
        <p className="text-muted-foreground mb-6">
          Your order has been placed successfully. Payment on delivery.
        </p>
        <div className="flex gap-3">
          <Button
            data-ocid="checkout.view_orders_button"
            onClick={() => navigate("my-orders")}
            className="bg-primary text-primary-foreground"
          >
            View My Orders
          </Button>
          <Button
            data-ocid="checkout.shop_more_button"
            variant="outline"
            onClick={() => navigate("home")}
          >
            Shop More
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="pb-24">
      <div className="px-4 py-4 border-b border-border flex items-center gap-2">
        <button
          type="button"
          data-ocid="checkout.back_button"
          onClick={() => navigate("cart")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="p-4 space-y-5">
        {/* Delivery Address */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4 text-primary" />
            Delivery Address
          </Label>
          <Textarea
            data-ocid="checkout.address_input"
            placeholder="Enter your full delivery address...&#10;House No., Street, City, State, PIN Code"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={4}
            required
            className="resize-none"
          />
        </div>

        {/* Payment Method */}
        <div className="bg-accent rounded-xl p-4">
          <p className="text-sm font-semibold mb-2">Payment Method</p>
          <div className="flex items-center gap-3 bg-background rounded-lg p-3 border border-primary/30">
            <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">
                Pay when your order arrives
              </p>
            </div>
            <span className="ml-auto text-green-600 text-xs font-semibold">
              ✓ Available
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-secondary rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-sm">
            Order Summary ({cart.length} items)
          </h3>
          {cart.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">
                ₹{(item.price * BigInt(item.quantity)).toString()}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">₹{cartTotal.toString()}</span>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3">
          <Button
            data-ocid="checkout.place_order_button"
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base"
            disabled={placeOrder.isPending}
          >
            {placeOrder.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Place Order · ₹{cartTotal.toString()}
          </Button>
        </div>
      </form>
    </div>
  );
}
