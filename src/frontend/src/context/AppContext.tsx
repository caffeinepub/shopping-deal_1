import { type ReactNode, createContext, useContext, useState } from "react";
import type { Product } from "../backend";

export type Page =
  | "home"
  | "product-detail"
  | "cart"
  | "checkout"
  | "my-orders"
  | "admin-orders"
  | "f-offers"
  | "offers"
  | "add-product"
  | "sign-in"
  | "change-app-name";

export interface LocalCartItem {
  productId: string;
  name: string;
  price: bigint;
  quantity: number;
  imageUrl: string | undefined;
}

interface AppContextType {
  page: Page;
  navigate: (page: Page, productId?: string) => void;
  selectedProductId: string | null;
  cart: LocalCartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: bigint;
  cartCount: number;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>("home");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = (newPage: Page, productId?: string) => {
    setPage(newPage);
    if (productId) setSelectedProductId(productId);
    window.scrollTo(0, 0);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.image?.getDirectURL(),
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * BigInt(item.quantity),
    0n,
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        page,
        navigate,
        selectedProductId,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
