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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const saveProfile = useSaveProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim(), email: email.trim() });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Dialog open>
      <DialogContent
        data-ocid="profile_setup.dialog"
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Please enter your name and email to continue shopping.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              data-ocid="profile_setup.name_input"
              id="profile-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email Address</Label>
            <Input
              data-ocid="profile_setup.email_input"
              id="profile-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <Button
            data-ocid="profile_setup.submit_button"
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save & Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
