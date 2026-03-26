import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, ShieldCheck, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function SignInPage() {
  const { navigate } = useAppContext();
  const { login, identity, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  useEffect(() => {
    if (identity) {
      navigate("home");
    }
  }, [identity, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[80vh] flex flex-col"
    >
      <div className="px-4 py-4 border-b border-border flex items-center gap-2">
        <button
          type="button"
          data-ocid="sign_in.back_button"
          onClick={() => navigate("home")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Sign In</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-card">
          <ShieldCheck className="h-10 w-10 text-primary-foreground" />
        </div>

        <h2 className="font-display text-2xl font-bold text-center mb-2">
          Welcome to Shopping Deal
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-8 max-w-xs">
          Sign in securely using Internet Identity — your decentralized digital
          identity. No password needed.
        </p>

        {isLoginError && (
          <div
            data-ocid="sign_in.error_state"
            className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg w-full max-w-xs text-center"
          >
            {loginError?.message ?? "Login failed. Please try again."}
          </div>
        )}

        <Button
          data-ocid="sign_in.primary_button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full max-w-xs h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
            </>
          ) : (
            <>
              <User className="mr-2 h-5 w-5" /> Sign In with Internet Identity
            </>
          )}
        </Button>

        <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs">
          {["🔒 Secure", "⚡ Fast", "🌐 Decentralized"].map((item) => (
            <div key={item} className="text-center bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs">
          Internet Identity is a blockchain-based authentication system by
          DFINITY. Your identity is private and secure.
        </p>
      </div>
    </motion.div>
  );
}
