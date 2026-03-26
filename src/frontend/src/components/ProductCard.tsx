import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../backend";
import { useAppContext } from "../context/AppContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigate, addToCart } = useAppContext();
  const imageUrl = product.image?.getDirectURL();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-card rounded-lg shadow-card border border-border overflow-hidden flex flex-col"
      data-ocid={`product.item.${index + 1}`}
    >
      <button
        type="button"
        onClick={() => navigate("product-detail", product.id)}
        className="block relative bg-secondary aspect-square overflow-hidden"
        aria-label={`View ${product.name}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs capitalize">
          {product.category}
        </Badge>
      </button>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <button
          type="button"
          onClick={() => navigate("product-detail", product.id)}
          className="text-sm font-semibold text-foreground line-clamp-2 text-left hover:text-primary transition-colors"
        >
          {product.name}
        </button>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {product.description}
        </p>
        <div className="mt-auto">
          <p className="text-base font-bold text-foreground">
            ₹{product.price.toString()}
          </p>
          <Button
            data-ocid={`product.add_to_cart.${index + 1}`}
            size="sm"
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
