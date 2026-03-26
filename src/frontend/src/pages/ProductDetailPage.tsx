import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";
import { useProduct } from "../hooks/useQueries";

export default function ProductDetailPage() {
  const { selectedProductId, navigate, addToCart } = useAppContext();
  const { data: product, isLoading } = useProduct(selectedProductId);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${product.name} added to cart!`);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button onClick={() => navigate("home")} variant="link">
          Back to Home
        </Button>
      </div>
    );
  }

  const imageUrl = product.image?.getDirectURL();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      {/* Back */}
      <div className="px-3 pt-3">
        <button
          type="button"
          data-ocid="product_detail.back_button"
          onClick={() => navigate("home")}
          className="flex items-center gap-1 text-primary text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Image */}
      <div className="mx-3 mt-2 bg-secondary rounded-xl overflow-hidden aspect-square">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-24 w-24 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 mt-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="font-display text-xl font-bold text-foreground leading-tight flex-1">
            {product.name}
          </h1>
          <Badge className="bg-primary text-primary-foreground capitalize flex-shrink-0">
            {product.category}
          </Badge>
        </div>

        <p className="text-2xl font-bold text-foreground">
          ₹{product.price.toString()}
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        {/* Quantity */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Qty:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="product_detail.qty_minus"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              type="button"
              data-ocid="product_detail.qty_plus"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Cash on delivery badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent rounded-lg p-3">
          <span className="text-green-600 font-semibold">
            ✓ Cash on Delivery Available
          </span>
        </div>
      </div>

      {/* Add to cart CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3">
        <Button
          data-ocid="product_detail.add_to_cart_button"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add {quantity > 1 ? `${quantity} items` : "to Cart"} · ₹
          {(product.price * BigInt(quantity)).toString()}
        </Button>
      </div>
    </motion.div>
  );
}
