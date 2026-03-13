import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Leaf, LogOut, User } from "lucide-react";
import type { FoodBridgeUser } from "../backend.d";
import { Variant_ngo_donor } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  profile?: FoodBridgeUser | null;
}

export default function Header({ profile }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const roleBadge =
    profile?.role === Variant_ngo_donor.donor
      ? "🍽️ Donor"
      : profile?.role === Variant_ngo_donor.ngo
        ? "🤝 NGO"
        : null;

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            FoodBridge
          </span>
        </div>

        <div className="flex items-center gap-2">
          {profile && roleBadge && (
            <div className="hidden sm:flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1 text-xs font-medium text-secondary-foreground">
              <User className="h-3 w-3" />
              <span className="max-w-[100px] truncate">{profile.name}</span>
              <span className="opacity-60">·</span>
              <span>{roleBadge}</span>
            </div>
          )}
          <Button
            size="sm"
            variant={isAuthenticated ? "outline" : "default"}
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="gap-1.5"
          >
            {isAuthenticated ? (
              <>
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </>
            ) : isLoggingIn ? (
              "Logging in..."
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
