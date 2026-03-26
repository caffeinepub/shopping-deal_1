import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2, Percent, Plus, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useAppContext } from "../context/AppContext";
import { useAllOffers, useCreateFounderOffer } from "../hooks/useQueries";

export default function FOffersPage() {
  const { navigate, isAdmin } = useAppContext();
  const { data: offersData, isLoading } = useAllOffers();
  const createOffer = useCreateFounderOffer();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [productId, setProductId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Access denied. Admin only.</p>
      </div>
    );
  }

  const founderOffers = offersData?.founderOffers ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !discount) return;
    setUploading(true);
    try {
      let imageBlob: ExternalBlob | undefined;
      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes);
      }
      await createOffer.mutateAsync({
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        discount: BigInt(Math.round(Number(discount))),
        productId: productId.trim() || undefined,
        createdAt: BigInt(Date.now()) * 1_000_000n,
        image: imageBlob,
      });
      toast.success("Offer created!");
      setTitle("");
      setDescription("");
      setDiscount("");
      setProductId("");
      setImageFile(null);
      setShowForm(false);
    } catch {
      toast.error("Failed to create offer");
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
            data-ocid="f_offers.back_button"
            onClick={() => navigate("home")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold">F Offers</h1>
        </div>
        <Button
          data-ocid="f_offers.add_offer_button"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Offer
        </Button>
      </div>

      {/* Add Offer Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mx-4 mt-4 bg-accent rounded-xl p-4"
        >
          <h2 className="font-semibold mb-4">New Founder Offer</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input
                data-ocid="f_offers.title_input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Sale"
                required
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                data-ocid="f_offers.description_input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the offer..."
                required
                rows={3}
              />
            </div>
            <div>
              <Label>Discount % *</Label>
              <Input
                data-ocid="f_offers.discount_input"
                type="number"
                min="1"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="e.g. 30"
                required
              />
            </div>
            <div>
              <Label>Product ID (optional)</Label>
              <Input
                data-ocid="f_offers.product_id_input"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Link to a specific product"
              />
            </div>
            <div>
              <Label>Offer Image (optional)</Label>
              <input
                data-ocid="f_offers.upload_button"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="f_offers.submit_button"
                type="submit"
                className="flex-1 bg-primary text-primary-foreground"
                disabled={uploading || createOffer.isPending}
              >
                {(uploading || createOffer.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Offer
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

      {/* Offers List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }, (_, i) => `sk-${i}`).map((key) => (
            <Skeleton key={key} className="h-24 rounded-xl" />
          ))
        ) : founderOffers.length === 0 ? (
          <div className="py-12 text-center" data-ocid="f_offers.empty_state">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No founder offers yet.</p>
          </div>
        ) : (
          founderOffers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 flex gap-3"
              data-ocid={`f_offers.item.${i + 1}`}
            >
              {offer.image && (
                <img
                  src={offer.image.getDirectURL()}
                  alt={offer.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{offer.title}</h3>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    <Percent className="h-2.5 w-2.5 inline" />
                    {offer.discount.toString()}% OFF
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {offer.description}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
