import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAppContext } from "../context/AppContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, navigate } =
    useAppContext();

  return (
    <div className="pb-24">
      <div className="px-4 py-4 border-b border-border">
        <h1 className="font-display text-xl font-bold">My Cart</h1>
        <p className="text-sm text-muted-foreground">
          {cart.length} item{cart.length !== 1 ? "s" : ""}
        </p>
      </div>

      {cart.length === 0 ? (
        <div
          data-ocid="cart.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center px-4"
        >
          <ShoppingBag className="h-20 w-20 text-muted-foreground mb-4" />
          <h2 className="font-display text-lg font-semibold mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Add some products to get started!
          </p>
          <Button
            data-ocid="cart.shop_now_button"
            onClick={() => navigate("home")}
            className="bg-primary text-primary-foreground"
          >
            Shop Now
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border" data-ocid="cart.list">
            <AnimatePresence>
              {cart.map((item, i) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-3 p-4"
                  data-ocid={`cart.item.${i + 1}`}
                >
                  <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        📦
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-base font-bold text-primary mt-0.5">
                      ₹{item.price.toString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      data-ocid={`cart.delete_button.${i + 1}`}
                      onClick={() => removeFromCart(item.productId)}
                      className="text-destructive hover:opacity-70"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-7 h-7 rounded border border-border flex items-center justify-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-7 h-7 rounded border border-border flex items-center justify-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="mx-4 mt-4 bg-accent rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-sm">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{cartTotal.toString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">₹{cartTotal.toString()}</span>
            </div>
          </div>
        </>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3">
          <Button
            data-ocid="cart.checkout_button"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base"
            onClick={() => navigate("checkout")}
          >
            Proceed to Checkout · ₹{cartTotal.toString()}
          </Button>
        </div>
      )}
    </div>
  );
}
