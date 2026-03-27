import { useState } from "react";
import { toast } from "sonner";

import { mediaService } from "./media.service";

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
import type { MediaType } from "@/types/media";

export function UploadDialog({
  type,
  onSuccess,
}: {
  type: MediaType;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("name", name);
      formData.append("category", category);

      // convert comma separated → JSON array
      formData.append(
        "tags",
        JSON.stringify(tags.split(",").map((t) => t.trim())),
      );

      formData.append("isPremium", String(isPremium));

      await mediaService.upload(type, formData);

      toast.success(type + " uploaded");
      onSuccess();
      setOpen(false);
      reset();
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setName("");
    setCategory("");
    setTags("");
    setIsPremium(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload {type}</Button>
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Upload {type}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {file && (
            <img
              src={URL.createObjectURL(file)}
              className="w-16 h-16 rounded border"
            />
          )}
          <Label>Image</Label>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Funny icon"
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="funny"
          />
        </div>

        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="cat, funny"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={isPremium}
            onCheckedChange={(v) => setIsPremium(!!v)}
          />
          <Label>Premium {type}</Label>
        </div>

        <Button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
