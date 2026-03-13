import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Leaf, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_ngo_donor } from "../backend.d";
import { useSaveProfile } from "../hooks/useQueries";

interface ProfileSetupProps {
  open: boolean;
}

export default function ProfileSetup({ open }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState<Variant_ngo_donor | "">("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  const { mutateAsync, isPending } = useSaveProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    try {
      await mutateAsync({
        role: role as Variant_ngo_donor,
        name,
        organizationName: orgName,
        address,
        lat: 0.0,
        lng: 0.0,
        contact,
      });
      toast.success("Profile created! Welcome to FoodBridge.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={open} data-ocid="profile.setup.dialog">
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        data-ocid="profile.setup.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">
              Welcome to FoodBridge
            </DialogTitle>
          </div>
          <DialogDescription>
            Tell us about yourself to get started. This helps us connect the
            right donors with NGOs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ps-role">I am a</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as Variant_ngo_donor)}
              required
            >
              <SelectTrigger id="ps-role" data-ocid="profile.role.select">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Variant_ngo_donor.donor}>
                  🍽️ Food Donor (Restaurant / Hotel / Event)
                </SelectItem>
                <SelectItem value={Variant_ngo_donor.ngo}>
                  🤝 NGO / Food Shelter
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ps-name">Your Name</Label>
            <Input
              id="ps-name"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-ocid="profile.name.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ps-org">Organization Name</Label>
            <Input
              id="ps-org"
              placeholder="e.g. The Grand Hotel / Hope Foundation"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              data-ocid="profile.org.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ps-address">Address</Label>
            <Input
              id="ps-address"
              placeholder="Street, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              data-ocid="profile.address.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ps-contact">Contact Number</Label>
            <Input
              id="ps-contact"
              placeholder="+91 98765 43210"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              data-ocid="profile.contact.input"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !role}
            data-ocid="profile.save_button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Join FoodBridge →"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
