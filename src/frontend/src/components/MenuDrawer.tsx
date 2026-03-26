import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ClipboardList,
  Grid3X3,
  Home,
  LogIn,
  LogOut,
  PlusSquare,
  Settings,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { Page } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAppSettings } from "../hooks/useQueries";

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const { navigate, cartCount, isAdmin } = useAppContext();
  const { identity, clear } = useInternetIdentity();
  const { data: settings } = useAppSettings();
  const appName = settings?.appName ?? "Shopping Deal";

  const go = (page: Page) => {
    navigate(page);
    onClose();
  };

  const menuItems = [
    { icon: Home, label: "Home", page: "home" as Page, show: true },
    { icon: Grid3X3, label: "Categories", page: "home" as Page, show: true },
    {
      icon: ShoppingCart,
      label: "Cart",
      page: "cart" as Page,
      show: true,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      icon: ClipboardList,
      label: "My Orders",
      page: "my-orders" as Page,
      show: !!identity,
    },
    { icon: Star, label: "F Offers", page: "f-offers" as Page, show: isAdmin },
    {
      icon: PlusSquare,
      label: "Add Product",
      page: "add-product" as Page,
      show: isAdmin,
    },
    {
      icon: Settings,
      label: "Change App Name",
      page: "change-app-name" as Page,
      show: isAdmin,
    },
    {
      icon: ClipboardList,
      label: "Admin Orders",
      page: "admin-orders" as Page,
      show: isAdmin,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent data-ocid="menu.sheet" side="left" className="w-72 p-0">
        <SheetHeader className="bg-primary text-primary-foreground px-4 py-4">
          <SheetTitle className="text-white font-display text-xl">
            {appName}
          </SheetTitle>
          {identity ? (
            <p className="text-white/80 text-sm">
              Logged in · {isAdmin ? "Admin" : "Customer"}
            </p>
          ) : (
            <p className="text-white/80 text-sm">Guest</p>
          )}
        </SheetHeader>

        <nav className="flex flex-col py-2">
          {menuItems
            .filter((item) => item.show)
            .map((item) => (
              <button
                type="button"
                key={item.label}
                data-ocid={`menu.${item.label.toLowerCase().replace(/ /g, "_")}_link`}
                onClick={() => go(item.page)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent text-foreground text-sm font-medium transition-colors text-left"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}

          <Separator className="my-2" />

          {identity ? (
            <button
              type="button"
              data-ocid="menu.sign_out_button"
              onClick={() => {
                clear();
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent text-destructive text-sm font-medium transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              data-ocid="menu.sign_in_link"
              onClick={() => go("sign-in")}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent text-foreground text-sm font-medium transition-colors"
            >
              <LogIn className="h-5 w-5 text-primary" />
              Sign In
            </button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
