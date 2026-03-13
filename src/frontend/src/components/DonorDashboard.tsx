import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Plus,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { DonationStatus } from "../backend.d";
import type { FoodBridgeUser } from "../backend.d";
import { useGetMyDonations, useMarkPickedUp } from "../hooks/useQueries";
import DonationForm from "./DonationForm";

const statusConfig = {
  [DonationStatus.pending]: {
    label: "Pending",
    className: "status-pending",
    icon: Clock,
  },
  [DonationStatus.accepted]: {
    label: "Accepted",
    className: "status-accepted",
    icon: CheckCircle2,
  },
  [DonationStatus.pickedUp]: {
    label: "Picked Up",
    className: "status-picked-up",
    icon: Package,
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface DonorDashboardProps {
  profile: FoodBridgeUser;
}

export default function DonorDashboard({ profile }: DonorDashboardProps) {
  const [formOpen, setFormOpen] = useState(false);
  const { data: donations = [], isLoading } = useGetMyDonations();
  const { mutateAsync: markPickedUp, isPending: isMarkingPickedUp } =
    useMarkPickedUp();

  const handleMarkPickedUp = async (id: bigint) => {
    try {
      await markPickedUp(id);
      toast.success("Marked as picked up! Great job reducing food waste.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const pending = donations.filter((d) => d.status === DonationStatus.pending);
  const accepted = donations.filter(
    (d) => d.status === DonationStatus.accepted,
  );
  const pickedUp = donations.filter(
    (d) => d.status === DonationStatus.pickedUp,
  );

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", count: pending.length, color: "text-amber-600" },
          { label: "Accepted", count: accepted.length, color: "text-blue-600" },
          {
            label: "Completed",
            count: pickedUp.length,
            color: "text-primary",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl p-4 text-center shadow-card border border-border"
          >
            <p className={`text-2xl font-display font-bold ${stat.color}`}>
              {stat.count}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Donate button */}
      <Button
        onClick={() => setFormOpen(true)}
        size="lg"
        className="w-full gap-2 text-base h-12 shadow-glow"
        data-ocid="donate.primary_button"
      >
        <Plus className="h-5 w-5" />
        Donate Surplus Food
      </Button>

      {/* Donations list */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-3">
          Your Donations
        </h2>

        {isLoading ? (
          <div className="space-y-3" data-ocid="donations.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div
            className="text-center py-12 bg-card rounded-xl border border-dashed border-border"
            data-ocid="donations.empty_state"
          >
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No donations yet
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Click &quot;Donate Surplus Food&quot; to get started
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
            {donations.map((donation, idx) => {
              const status = statusConfig[donation.status];
              const StatusIcon = status.icon;
              const markerIdx = idx + 1;
              return (
                <motion.div
                  key={String(donation.id)}
                  variants={itemVariants}
                  data-ocid={`donations.item.${markerIdx}`}
                >
                  <Card className="shadow-card hover:shadow-glow transition-shadow duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-display text-base font-semibold">
                          {donation.foodType}
                        </CardTitle>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            status.className
                          }`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" />
                          {donation.quantity}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {donation.expiryDescription}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          {donation.address}
                        </span>
                      </div>

                      {donation.status === DonationStatus.accepted && (
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-sm text-blue-700 font-medium">
                            Accepted by:{" "}
                            {donation.acceptedByNgoName || "An NGO"}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkPickedUp(donation.id)}
                            disabled={isMarkingPickedUp}
                            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                            data-ocid="donation.pickup_button"
                          >
                            {isMarkingPickedUp ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 animate-spin" />
                                Updating...
                              </span>
                            ) : (
                              "Mark Picked Up"
                            )}
                          </Button>
                        </div>
                      )}

                      {donation.notes && (
                        <p className="text-xs text-muted-foreground italic truncate">
                          Note: {donation.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <DonationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultAddress={profile.address}
      />
    </div>
  );
}
