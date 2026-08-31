import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { validateImage, type HubFormState } from "./hub-form"

export function HubFormFields({
  form,
  onChange,
  file,
  onFileChange,
  existingImageUrl,
}: {
  form: HubFormState
  onChange: (patch: Partial<HubFormState>) => void
  file: File | null
  onFileChange: (file: File | null) => void
  existingImageUrl?: string
}) {
  const previewUrl = file ? URL.createObjectURL(file) : existingImageUrl

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null
    if (next) {
      const error = validateImage(next)
      if (error) {
        toast.error(error)
        e.target.value = ""
        return
      }
    }
    onFileChange(next)
  }

  return (
    <div className="space-y-4">
      {/* Image */}
      <div className="space-y-2">
        <Label>Image</Label>
        {previewUrl && (
          <img
            src={previewUrl}
            className="w-16 h-16 rounded border object-cover"
            style={form.bg ? { backgroundColor: form.bg } : undefined}
          />
        )}
        <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} />
        <p className="text-xs text-muted-foreground">PNG, JPEG or WEBP · max 2 MB</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Retro Cat"
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Input
            value={form.category}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder="animals"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Author handle</Label>
          <Input
            value={form.authorHandle}
            onChange={(e) => onChange({ authorHandle: e.target.value })}
            placeholder="@mika"
          />
        </div>

        <div className="space-y-2">
          <Label>Author name</Label>
          <Input
            value={form.authorName}
            onChange={(e) => onChange({ authorName: e.target.value })}
            placeholder="Mika"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Author avatar URL</Label>
        <Input
          value={form.authorAvatarUrl}
          onChange={(e) => onChange({ authorAvatarUrl: e.target.value })}
          placeholder="https://…"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags (comma separated)</Label>
        <Input
          value={form.tags}
          onChange={(e) => onChange({ tags: e.target.value })}
          placeholder="cute, retro"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Backdrop color</Label>
          <Input
            value={form.bg}
            onChange={(e) => onChange({ bg: e.target.value })}
            placeholder="#0d0d0d"
          />
        </div>

        <div className="space-y-2">
          <Label>Dominant color</Label>
          <Input
            value={form.dominantColor}
            onChange={(e) => onChange({ dominantColor: e.target.value })}
            placeholder="#1a1a1a"
          />
        </div>
      </div>

      {/* e-paper device targets */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Target width</Label>
          <Input
            type="number"
            value={form.targetWidth}
            onChange={(e) => onChange({ targetWidth: e.target.value })}
            placeholder="800"
          />
        </div>

        <div className="space-y-2">
          <Label>Target height</Label>
          <Input
            type="number"
            value={form.targetHeight}
            onChange={(e) => onChange({ targetHeight: e.target.value })}
            placeholder="480"
          />
        </div>

        <div className="space-y-2">
          <Label>Color mode</Label>
          <select
            value={form.colorMode}
            onChange={(e) =>
              onChange({ colorMode: e.target.value as HubFormState["colorMode"] })
            }
            className={cn(
              "h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
            )}
          >
            <option value="">—</option>
            <option value="bw">bw</option>
            <option value="grayscale">grayscale</option>
            <option value="color">color</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={form.isPremium}
          onCheckedChange={(v) => onChange({ isPremium: !!v })}
        />
        <Label>Premium drop</Label>
      </div>
    </div>
  )
}
