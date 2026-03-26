import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, Type } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";
import { useAppSettings, useUpdateAppName } from "../hooks/useQueries";

export default function ChangeAppNamePage() {
  const { navigate, isAdmin } = useAppContext();
  const { data: settings } = useAppSettings();
  const updateAppName = useUpdateAppName();
  const [newName, setNewName] = useState(settings?.appName ?? "");

  if (!isAdmin) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Access denied. Admin only.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await updateAppName.mutateAsync(newName.trim());
      toast.success("App name updated!");
      navigate("home");
    } catch {
      toast.error("Failed to update app name");
    }
  };

  return (
    <div className="pb-6">
      <div className="px-4 py-4 border-b border-border flex items-center gap-2">
        <button
          type="button"
          data-ocid="change_name.back_button"
          onClick={() => navigate("home")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Change App Name</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6">
          <Type className="h-8 w-8 text-primary" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <div>
            <Label htmlFor="app-name">Current Name</Label>
            <p className="text-sm text-muted-foreground mb-3">
              {settings?.appName ?? "Shopping Deal"}
            </p>
            <Label htmlFor="new-app-name">New App Name *</Label>
            <Input
              data-ocid="change_name.input"
              id="new-app-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new app name"
              required
              className="mt-1"
            />
          </div>
          <Button
            data-ocid="change_name.save_button"
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={updateAppName.isPending}
          >
            {updateAppName.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
