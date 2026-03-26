import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, ProductCategory } from "../backend";
import { useAppContext } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateProduct } from "../hooks/useQueries";

const CATEGORIES = [
  { label: "Electronics", value: ProductCategory.electronics },
  { label: "Fashion", value: ProductCategory.fashion },
  { label: "Home", value: ProductCategory.home },
  { label: "Beauty", value: ProductCategory.beauty },
  { label: "Sports", value: ProductCategory.sports },
  { label: "Books", value: ProductCategory.books },
  { label: "Other", value: ProductCategory.other },
];

export default function AddProductPage() {
  const { navigate, isAdmin } = useAppContext();
  const { identity } = useInternetIdentity();
  const createProduct = useCreateProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Access denied. Admin only.</p>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !category || !identity) return;
    setUploading(true);
    try {
      let imageBlob: ExternalBlob | undefined;
      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes);
      }
      await createProduct.mutateAsync({
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        price: BigInt(Math.round(Number(price))),
        category: category as ProductCategory,
        founderId: identity.getPrincipal(),
        createdAt: BigInt(Date.now()) * 1_000_000n,
        image: imageBlob,
      });
      toast.success("Product added successfully!");
      navigate("home");
    } catch {
      toast.error("Failed to add product");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pb-6">
      <div className="px-4 py-4 border-b border-border flex items-center gap-2">
        <button
          type="button"
          data-ocid="add_product.back_button"
          onClick={() => navigate("home")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Image Upload */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Camera className="h-4 w-4 text-primary" /> Product Photo
          </Label>
          <label
            data-ocid="add_product.dropzone"
            className="block cursor-pointer"
          >
            <div className="border-2 border-dashed border-border rounded-xl overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center bg-secondary text-muted-foreground">
                  <Camera className="h-10 w-10 mb-2" />
                  <p className="text-sm">Tap to take photo or upload</p>
                </div>
              )}
            </div>
            <input
              data-ocid="add_product.upload_button"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="sr-only"
            />
          </label>
        </div>

        <div>
          <Label>Product Name *</Label>
          <Input
            data-ocid="add_product.name_input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Samsung Galaxy A54"
            required
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            data-ocid="add_product.description_input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product..."
            rows={3}
          />
        </div>

        <div>
          <Label>Price (₹) *</Label>
          <Input
            data-ocid="add_product.price_input"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 12999"
            required
          />
        </div>

        <div>
          <Label>Category *</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as ProductCategory)}
            required
          >
            <SelectTrigger data-ocid="add_product.category_select">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          data-ocid="add_product.submit_button"
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base mt-2"
          disabled={uploading || createProduct.isPending}
        >
          {(uploading || createProduct.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Add Product
        </Button>
      </form>
    </div>
  );
}
