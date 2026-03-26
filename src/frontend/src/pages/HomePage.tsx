import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ProductCategory } from "../backend";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";
import { useAllProducts } from "../hooks/useQueries";

const CATEGORIES = [
  { label: "All", value: undefined },
  { label: "Electronics", value: ProductCategory.electronics },
  { label: "Fashion", value: ProductCategory.fashion },
  { label: "Home", value: ProductCategory.home },
  { label: "Beauty", value: ProductCategory.beauty },
  { label: "Sports", value: ProductCategory.sports },
  { label: "Books", value: ProductCategory.books },
  { label: "Other", value: ProductCategory.other },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const { navigate, isAdmin } = useAppContext();
  const { data: products, isLoading } = useAllProducts(selectedCategory);

  const filtered = (products ?? []).filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      {/* Category pills */}
      <div className="sticky top-[88px] z-30 bg-background border-b border-border px-3 py-2">
        <div
          className="flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
          data-ocid="categories.tab"
        >
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <input
          data-ocid="home.search_input"
          type="text"
          placeholder="Search products..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Hero Banner */}
      <div className="mx-3 mt-3 rounded-xl overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_800x300.jpg"
          alt="Big Deals"
          className="w-full object-cover max-h-40"
        />
      </div>

      {/* Admin Add Product CTA */}
      {isAdmin && (
        <div className="mx-3 mt-3">
          <button
            type="button"
            data-ocid="home.add_product_button"
            onClick={() => navigate("add-product")}
            className="w-full border-2 border-dashed border-primary/40 rounded-lg py-3 text-primary text-sm font-semibold hover:border-primary hover:bg-accent transition-colors"
          >
            + Add New Product
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="px-3 pb-6 mt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((key) => (
              <div key={key} className="rounded-lg overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="products.empty_state"
          >
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No products found" : "No products yet"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {isAdmin
                ? "Add your first product using the button above."
                : "Check back soon — new products are coming!"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
