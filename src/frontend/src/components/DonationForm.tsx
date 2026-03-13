import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitDonation } from "../hooks/useQueries";

interface DonationFormProps {
  open: boolean;
  onClose: () => void;
  defaultAddress?: string;
}

export default function DonationForm({
  open,
  onClose,
  defaultAddress = "",
}: DonationFormProps) {
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");
  const [address, setAddress] = useState(defaultAddress);
  const [notes, setNotes] = useState("");

  const { mutateAsync, isPending } = useSubmitDonation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({
        foodType,
        quantity,
        expiryDescription: expiry,
        address,
        lat: 0.0,
        lng: 0.0,
        notes,
      });
      toast.success("Donation submitted! NGOs have been notified.");
      setFoodType("");
      setQuantity("");
      setExpiry("");
      setAddress(defaultAddress);
      setNotes("");
      onClose();
    } catch {
      toast.error("Failed to submit donation. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Utensils className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">
              Donate Surplus Food
            </DialogTitle>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-2"
          data-ocid="donate.form"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="df-foodtype">Food Type</Label>
              <Input
                id="df-foodtype"
                placeholder="Biryani, Salads, Bread..."
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                required
                data-ocid="donate.food_type.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="df-quantity">Quantity</Label>
              <Input
                id="df-quantity"
                placeholder="50 servings"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                data-ocid="donate.quantity.input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="df-expiry">Best Before / Expiry</Label>
            <Input
              id="df-expiry"
              placeholder="Best before 8pm today"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              required
              data-ocid="donate.expiry.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="df-address">Pickup Address</Label>
            <Input
              id="df-address"
              placeholder="Street, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              data-ocid="donate.address.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="df-notes">
              Notes{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="df-notes"
              placeholder="Allergens, packaging info, heating instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-ocid="donate.notes.textarea"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1"
              data-ocid="donate.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Donation"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
