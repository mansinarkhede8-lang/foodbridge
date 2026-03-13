import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  HandHeart,
  Loader2,
  MapIcon,
  MapPin,
  Package,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { DonationStatus } from "../backend.d";
import type { Donation, FoodBridgeUser } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAcceptDonation,
  useGetAllDonations,
  useGetAvailableDonations,
} from "../hooks/useQueries";
import MapView from "./MapView";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface NgoDashboardProps {
  profile: FoodBridgeUser;
}

function AvailableDonationCard({
  donation,
  idx,
}: {
  donation: Donation;
  idx: number;
}) {
  const { mutateAsync: accept, isPending } = useAcceptDonation();

  const handleAccept = async () => {
    try {
      await accept(donation.id);
      toast.success(
        `Accepted! Pickup from: ${donation.address}. Notify the donor you're on your way.`,
      );
    } catch {
      toast.error("Failed to accept donation. Please try again.");
    }
  };

  const timeAgo = (ts: bigint) => {
    const msAgo = Date.now() - Number(ts / 1_000_000n);
    const mins = Math.floor(msAgo / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <motion.div variants={itemVariants} data-ocid={`donations.item.${idx}`}>
      <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-display text-base font-semibold">
              {donation.foodType}
            </CardTitle>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {timeAgo(donation.createdAt)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground">
                {donation.quantity}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              {donation.expiryDescription}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{donation.address}</span>
          </div>
          {donation.notes && (
            <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 italic">
              {donation.notes}
            </p>
          )}
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isPending}
            className="w-full gap-1.5"
            data-ocid="donation.accept_button"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <HandHeart className="h-3.5 w-3.5" />
                Accept Donation
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AcceptedDonationCard({
  donation,
  ngoProfile,
  idx,
}: {
  donation: Donation;
  ngoProfile: FoodBridgeUser;
  idx: number;
}) {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <motion.div variants={itemVariants} data-ocid={`donations.item.${idx}`}>
      <Card className="shadow-card border-l-4 border-l-primary/60">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-display text-base font-semibold">
              {donation.foodType}
            </CardTitle>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full status-accepted">
              {donation.status === DonationStatus.pickedUp
                ? "Picked Up"
                : "Accepted"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-3.5 w-3.5 text-primary" />
              {donation.quantity}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              {donation.expiryDescription}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{donation.address}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            onClick={() => setMapOpen((v) => !v)}
          >
            <MapIcon className="h-3.5 w-3.5" />
            {mapOpen ? "Hide" : "View"} Map & Distance
            {mapOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>

          {mapOpen && <MapView donation={donation} ngoProfile={ngoProfile} />}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function NgoDashboard({ profile }: NgoDashboardProps) {
  const { data: available = [], isLoading: loadingAvailable } =
    useGetAvailableDonations();
  const { data: allDonations = [], isLoading: loadingAll } =
    useGetAllDonations();
  const { identity } = useInternetIdentity();

  const myPrincipal = identity?.getPrincipal().toString();
  const myAccepted = allDonations.filter(
    (d) =>
      d.acceptedByNgoId?.toString() === myPrincipal &&
      (d.status === DonationStatus.accepted ||
        d.status === DonationStatus.pickedUp),
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 text-center shadow-card border border-border">
          <p className="text-2xl font-display font-bold text-amber-600">
            {available.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Available</p>
        </div>
        <div className="bg-card rounded-xl p-4 text-center shadow-card border border-border">
          <p className="text-2xl font-display font-bold text-primary">
            {myAccepted.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">My Accepted</p>
        </div>
      </div>

      <Tabs defaultValue="available">
        <TabsList className="w-full">
          <TabsTrigger
            value="available"
            className="flex-1"
            data-ocid="nav.ngo_tab"
          >
            Available ({available.length})
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className="flex-1"
            data-ocid="nav.donor_tab"
          >
            My Accepted ({myAccepted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          {loadingAvailable ? (
            <div className="space-y-3" data-ocid="donations.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : available.length === 0 ? (
            <div
              className="text-center py-12 bg-card rounded-xl border border-dashed border-border"
              data-ocid="donations.empty_state"
            >
              <HandHeart className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                No available donations right now
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Check back soon — new donations are added regularly
              </p>
            </div>
          ) : (
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              data-ocid="donations.list"
            >
              {available.map((donation, idx) => (
                <AvailableDonationCard
                  key={String(donation.id)}
                  donation={donation}
                  idx={idx + 1}
                />
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-4">
          {loadingAll ? (
            <div className="space-y-3" data-ocid="donations.loading_state">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : myAccepted.length === 0 ? (
            <div
              className="text-center py-12 bg-card rounded-xl border border-dashed border-border"
              data-ocid="donations.empty_state"
            >
              <MapIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                No accepted donations yet
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Accept a donation from the Available tab
              </p>
            </div>
          ) : (
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {myAccepted.map((donation, idx) => (
                <AcceptedDonationCard
                  key={String(donation.id)}
                  donation={donation}
                  ngoProfile={profile}
                  idx={idx + 1}
                />
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
