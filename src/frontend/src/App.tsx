import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Leaf } from "lucide-react";
import { Variant_ngo_donor } from "./backend.d";
import DonorDashboard from "./components/DonorDashboard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import NgoDashboard from "./components/NgoDashboard";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetProfile } from "./hooks/useQueries";

const queryClient = new QueryClient();

function AppContent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: profile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && profile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header profile={profile} />

      {!isAuthenticated ? (
        <main className="flex-1">
          <LandingPage />
        </main>
      ) : profileLoading ? (
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <LoadingSkeleton />
        </main>
      ) : (
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          {showProfileSetup && <ProfileSetup open={showProfileSetup} />}

          {profile &&
            (profile.role === Variant_ngo_donor.donor ? (
              <DonorDashboard profile={profile} />
            ) : (
              <NgoDashboard profile={profile} />
            ))}
        </main>
      )}

      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" data-ocid="map.loading_state">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Leaf className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
