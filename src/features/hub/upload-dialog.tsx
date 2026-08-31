import { useState } from "react"
import { toast } from "sonner"

import { hubService } from "./hub.service"
import { HubFormFields } from "./hub-form-fields"
import { emptyHubForm, parseTagsInput, type HubFormState } from "./hub-form"

import Button from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { apiErrorMessage } from "@/lib/api-error"

export function UploadDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState<HubFormState>(emptyHubForm)
  const [loading, setLoading] = useState(false)

  const patch = (p: Partial<HubFormState>) => setForm((f) => ({ ...f, ...p }))

  const reset = () => {
    setForm(emptyHubForm)
    setFile(null)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("An image is required")
      return
    }
    if (!form.name.trim() || !form.authorHandle.trim()) {
      toast.error("Name and author handle are required")
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("image", file)
      fd.append("name", form.name.trim())
      fd.append("authorHandle", form.authorHandle.trim())

      // optional strings — only send when set
      const optional: [string, string][] = [
        ["authorName", form.authorName],
        ["authorAvatarUrl", form.authorAvatarUrl],
        ["bg", form.bg],
        ["description", form.description],
        ["category", form.category],
        ["dominantColor", form.dominantColor],
        ["targetWidth", form.targetWidth],
        ["targetHeight", form.targetHeight],
        ["colorMode", form.colorMode],
      ]
      for (const [key, value] of optional) {
        if (value.trim()) fd.append(key, value.trim())
      }

      fd.append("tags", JSON.stringify(parseTagsInput(form.tags)))
      fd.append("isPremium", String(form.isPremium))

      await hubService.create(fd)

      toast.success("Hub drop created")
      onSuccess()
      setOpen(false)
      reset()
    } catch (error) {
      toast.error(apiErrorMessage(error, "Create failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button>New drop</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New hub drop</DialogTitle>
        </DialogHeader>

        <HubFormFields
          form={form}
          onChange={patch}
          file={file}
          onFileChange={setFile}
        />

        <Button onClick={handleUpload} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
