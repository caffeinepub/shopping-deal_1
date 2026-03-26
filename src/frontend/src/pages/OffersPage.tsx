import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2, Percent, Plus, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useAppContext } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllOffers,
  useCallerProfile,
  useCreateCustomerOffer,
} from "../hooks/useQueries";

export default function OffersPage() {
  const { navigate } = useAppContext();
  const { identity } = useInternetIdentity();
  const { data: offersData, isLoading } = useAllOffers();
  const { data: profile } = useCallerProfile();
  const createCustomerOffer = useCreateCustomerOffer();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const founderOffers = offersData?.founderOffers ?? [];
  const customerOffers = offersData?.customerOffers ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Please sign in to post an offer");
      return;
    }
    if (!title.trim() || !description.trim() || !price) return;
    setUploading(true);
    try {
      let imageBlob: ExternalBlob | undefined;
      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes);
      }
      await createCustomerOffer.mutateAsync({
        id: crypto.randomUUID(),
        customerName: profile?.name ?? "Customer",
        customerId: identity.getPrincipal(),
        title: title.trim(),
        description: description.trim(),
        price: BigInt(Math.round(Number(price))),
        createdAt: BigInt(Date.now()) * 1_000_000n,
        image: imageBlob,
      });
      toast.success("Offer posted!");
      setTitle("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      setShowForm(false);
    } catch {
      toast.error("Failed to post offer");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pb-6">
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="offers.back_button"
            onClick={() => navigate("home")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Offers</h1>
        </div>
        {identity && (
          <Button
            data-ocid="offers.post_offer_button"
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            className="bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            Post Offer
          </Button>
        )}
      </div>

      {/* Post Offer Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mx-4 mt-4 bg-accent rounded-xl p-4"
        >
          <h2 className="font-semibold mb-4">Post Your Offer</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input
                data-ocid="offers.title_input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Selling iPhone 12"
                required
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                data-ocid="offers.description_input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you're offering..."
                required
                rows={3}
              />
            </div>
            <div>
              <Label>Price (₹) *</Label>
              <Input
                data-ocid="offers.price_input"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 5000"
                required
              />
            </div>
            <div>
              <Label>Photo (optional)</Label>
              <input
                data-ocid="offers.upload_button"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="offers.submit_button"
                type="submit"
                className="flex-1 bg-primary text-primary-foreground"
                disabled={uploading || createCustomerOffer.isPending}
              >
                {(uploading || createCustomerOffer.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Post Offer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <Tabs defaultValue="founder" className="mt-4">
        <TabsList
          className="mx-4 grid grid-cols-2 w-[calc(100%-2rem)]"
          data-ocid="offers.tab"
        >
          <TabsTrigger value="founder">
            🏷️ Deal Offers ({founderOffers.length})
          </TabsTrigger>
          <TabsTrigger value="customer">
            👥 Customer Offers ({customerOffers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="founder" className="p-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }, (_, i) => `sk-${i}`).map((key) => (
              <Skeleton key={key} className="h-24 rounded-xl" />
            ))
          ) : founderOffers.length === 0 ? (
            <div
              className="py-12 text-center"
              data-ocid="founder_offers.empty_state"
            >
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No deals available right now.
              </p>
            </div>
          ) : (
            founderOffers.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-primary/20 rounded-xl p-4 flex gap-3"
                data-ocid={`founder_offers.item.${i + 1}`}
              >
                {offer.image && (
                  <img
                    src={offer.image.getDirectURL()}
                    alt={offer.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{offer.title}</h3>
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      <Percent className="h-2.5 w-2.5 inline" />
                      {offer.discount.toString()}% OFF
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                    {offer.description}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="customer" className="p-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }, (_, i) => `sk-${i}`).map((key) => (
              <Skeleton key={key} className="h-24 rounded-xl" />
            ))
          ) : customerOffers.length === 0 ? (
            <div
              className="py-12 text-center"
              data-ocid="customer_offers.empty_state"
            >
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No customer offers yet.</p>
              {identity && (
                <Button
                  data-ocid="customer_offers.post_button"
                  size="sm"
                  onClick={() => setShowForm(true)}
                  className="mt-3 bg-primary text-primary-foreground"
                >
                  Post First Offer
                </Button>
              )}
            </div>
          ) : (
            customerOffers.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 flex gap-3"
                data-ocid={`customer_offers.item.${i + 1}`}
              >
                {offer.image && (
                  <img
                    src={offer.image.getDirectURL()}
                    alt={offer.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{offer.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {offer.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {offer.description}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">
                    ₹{offer.price.toString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
