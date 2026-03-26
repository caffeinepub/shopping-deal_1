import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Tag } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useAppSettings } from "../hooks/useQueries";
import MenuDrawer from "./MenuDrawer";

export default function Navbar() {
  const { navigate, cartCount } = useAppContext();
  const { data: settings } = useAppSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const appName = settings?.appName ?? "Shopping Deal";

  return (
    <>
      <header className="sticky top-0 z-40 bg-primary shadow-md">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Hamburger */}
          <button
            type="button"
            data-ocid="nav.menu_open_modal_button"
            onClick={() => setMenuOpen(true)}
            className="p-1.5 rounded text-primary-foreground hover:bg-white/20 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <div className="flex flex-col gap-1">
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
            </div>
          </button>

          {/* App name */}
          <button
            type="button"
            data-ocid="nav.home_link"
            onClick={() => navigate("home")}
            className="font-display font-bold text-white text-lg leading-tight flex-shrink-0"
          >
            {appName}
          </button>

          {/* Cart */}
          <div className="flex-1" />
          <button
            type="button"
            data-ocid="nav.cart_button"
            onClick={() => navigate("cart")}
            className="relative p-1.5 text-white flex-shrink-0"
            aria-label="Cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-yellow-400 text-foreground text-xs font-bold border-0">
                {cartCount}
              </Badge>
            )}
          </button>

          {/* Founder tag */}
          <div className="flex-shrink-0 text-white/90 text-xs font-semibold bg-white/20 px-2 py-1 rounded">
            Divyansh
          </div>
        </div>

        {/* Offers button bar */}
        <div className="bg-primary-foreground/5 border-t border-white/20 px-3 py-1.5">
          <button
            type="button"
            data-ocid="offers.button"
            onClick={() => navigate("offers")}
            className="flex items-center gap-1.5 text-white text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            <Tag className="h-3 w-3" />
            🏷️ Customer Offers
          </button>
        </div>
      </header>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
