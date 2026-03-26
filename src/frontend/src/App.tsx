import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { AppProvider, useAppContext } from "./context/AppContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerProfile, useIsAdmin } from "./hooks/useQueries";
import AddProductPage from "./pages/AddProductPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import CartPage from "./pages/CartPage";
import ChangeAppNamePage from "./pages/ChangeAppNamePage";
import CheckoutPage from "./pages/CheckoutPage";
import FOffersPage from "./pages/FOffersPage";
import HomePage from "./pages/HomePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OffersPage from "./pages/OffersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SignInPage from "./pages/SignInPage";

function AppInner() {
  const { page, setIsAdmin } = useAppContext();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const { data: profile } = useCallerProfile();

  useEffect(() => {
    if (isAdmin !== undefined) setIsAdmin(isAdmin);
  }, [isAdmin, setIsAdmin]);

  const showProfileSetup = !!identity && profile === null;

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage />;
      case "product-detail":
        return <ProductDetailPage />;
      case "cart":
        return <CartPage />;
      case "checkout":
        return <CheckoutPage />;
      case "my-orders":
        return <MyOrdersPage />;
      case "admin-orders":
        return <AdminOrdersPage />;
      case "f-offers":
        return <FOffersPage />;
      case "offers":
        return <OffersPage />;
      case "add-product":
        return <AddProductPage />;
      case "sign-in":
        return <SignInPage />;
      case "change-app-name":
        return <ChangeAppNamePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <footer className="bg-foreground text-primary-foreground py-4 text-center text-sm">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          caffeine.ai
        </a>
      </footer>
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
