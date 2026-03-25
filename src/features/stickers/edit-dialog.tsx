import { useEffect, useState } from "react";
import { toast } from "sonner";

import { stickersService } from "./stickers.service";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Sticker } from "@/types/sticker";

export function EditDialog({
  sticker,
  onSuccess,
}: {
  sticker: Sticker;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const [loading, setLoading] = useState(false);

  const initialTags = sticker.tags?.join(", ") ?? "";
  const isDirty =
    file !== null ||
    name !== sticker.name ||
    category !== sticker.category ||
    tags !== initialTags ||
    isPremium !== sticker.isPremium;

  useEffect(() => {
    if (sticker) {
      setName(sticker.name);
      setCategory(sticker.category);
      setTags(sticker.tags?.join(", "));
      setIsPremium(sticker.isPremium);
      setFile(null);
    }
  }, [sticker, open]);

  const handleUpdate = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      // optional image
      if (file) {
        formData.append("image", file);
      }

      formData.append("name", name);
      formData.append("category", category);

      formData.append(
        "tags",
        JSON.stringify(tags.split(",").map((t) => t.trim())),
      );

      formData.append("isPremium", String(isPremium));

      await stickersService.update(sticker.id, formData);

      toast.success("Sticker updated");
      onSuccess();
      setOpen(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Sticker</DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="space-y-2">
          <Label>Image</Label>

          {(file || sticker.imageUrl) && (
            <img
              src={file ? URL.createObjectURL(file) : sticker.imageUrl}
              className="w-16 h-16 rounded border"
            />
          )}

          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        {/* Premium */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isPremium}
            onCheckedChange={(v) => setIsPremium(!!v)}
          />
          <Label>Premium Sticker</Label>
        </div>

        <Button onClick={handleUpdate} disabled={loading || !isDirty}>
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
