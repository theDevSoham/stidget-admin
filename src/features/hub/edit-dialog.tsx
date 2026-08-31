import { useEffect, useState } from "react"
import { toast } from "sonner"

import { hubService } from "./hub.service"
import { HubFormFields } from "./hub-form-fields"
import {
  emptyHubForm,
  hubToForm,
  parseTagsInput,
  type HubFormState,
} from "./hub-form"

import Button from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage } from "@/lib/api-error"

// Fields that map straight to a form value and clear to null when sent empty.
const TEXT_KEYS = [
  "name",
  "authorHandle",
  "authorName",
  "authorAvatarUrl",
  "bg",
  "description",
  "category",
] as const

// e-paper metadata fields, handled specially around image replacement.
const DEVICE_KEYS = [
  "dominantColor",
  "targetWidth",
  "targetHeight",
  "colorMode",
] as const

export function EditDialog({
  id,
  imageUrl,
  onSuccess,
}: {
  id: string
  imageUrl: string
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [loading, setLoading] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState<HubFormState>(emptyHubForm)
  // Snapshot of the fetched values, so we can send only what actually changed.
  const [initial, setInitial] = useState<HubFormState>(emptyHubForm)

  const patch = (p: Partial<HubFormState>) => setForm((f) => ({ ...f, ...p }))

  useEffect(() => {
    if (!open) return
    let cancelled = false

    setFetching(true)
    setFile(null)
    hubService
      .getById(id)
      .then((hub) => {
        if (cancelled) return
        const next = hubToForm(hub)
        setForm(next)
        setInitial(next)
      })
      .catch((error) => {
        toast.error(apiErrorMessage(error, "Failed to load drop"))
        setOpen(false)
      })
      .finally(() => {
        if (!cancelled) setFetching(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, id])

  const buildFormData = () => {
    const fd = new FormData()

    if (file) fd.append("image", file)

    for (const key of TEXT_KEYS) {
      if (form[key] !== initial[key]) fd.append(key, form[key])
    }

    if (form.tags !== initial.tags) {
      fd.append("tags", JSON.stringify(parseTagsInput(form.tags)))
    }
    if (form.isPremium !== initial.isPremium) {
      fd.append("isPremium", String(form.isPremium))
    }

    // Replacing the image rebuilds imageMeta from scratch, so re-send every
    // device field we have to keep it; otherwise merge only the changed ones.
    for (const key of DEVICE_KEYS) {
      if (file) {
        if (form[key]) fd.append(key, form[key])
      } else if (form[key] !== initial[key]) {
        fd.append(key, form[key])
      }
    }

    return fd
  }

  const handleUpdate = async () => {
    const fd = buildFormData()

    if (![...fd.keys()].length) {
      toast.info("No changes to save")
      return
    }

    setLoading(true)
    try {
      await hubService.update(id, fd)
      toast.success("Hub drop updated")
      onSuccess()
      setOpen(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, "Update failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit hub drop</DialogTitle>
        </DialogHeader>

        {fetching ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            <HubFormFields
              form={form}
              onChange={patch}
              file={file}
              onFileChange={setFile}
              existingImageUrl={imageUrl}
            />

            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
