import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { X } from "lucide-react"

import { hubService } from "./hub.service"
import { validateImage } from "./hub-form"

import Button from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiErrorMessage } from "@/lib/api-error"

const SHEET_EXTENSIONS = [".xlsx", ".xls", ".csv"]
const MAX_SHEET_BYTES = 5 * 1024 * 1024
const MAX_IMAGES = 50

interface BulkError {
  row?: number
  message: string
}

// Backend validation failures carry `errors: { row?, message }[]`, where
// `row` is the spreadsheet row number (row 1 = headers).
function bulkErrors(error: unknown): BulkError[] {
  if (axios.isAxiosError(error) && Array.isArray(error.response?.data?.errors)) {
    return error.response.data.errors
  }
  return []
}

// Request-level errors (no row) first, then one group per row in sheet order.
function groupByRow(errors: BulkError[]): [number | null, string[]][] {
  const groups = new Map<number | null, string[]>()
  for (const e of errors) {
    const key = e.row ?? null
    groups.set(key, [...(groups.get(key) ?? []), e.message])
  }
  return [...groups.entries()].sort(([a], [b]) => (a ?? 0) - (b ?? 0))
}

function validateSheet(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!SHEET_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "Sheet must be .xlsx, .xls or .csv"
  }
  if (file.size > MAX_SHEET_BYTES) {
    return "Sheet must be 5 MB or smaller"
  }
  return null
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function BulkUploadDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [serverErrors, setServerErrors] = useState<BulkError[]>([])

  const clearServerErrors = () => {
    setServerMessage(null)
    setServerErrors([])
  }

  const reset = () => {
    setSheet(null)
    setImages([])
    clearServerErrors()
  }

  const handleSheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    e.target.value = ""
    if (!f) return
    const err = validateSheet(f)
    if (err) {
      toast.error(err)
      return
    }
    setSheet(f)
    clearServerErrors()
  }

  // Selections accumulate so images can be picked from several folders. Rows
  // match on file name, so a re-picked name replaces the earlier file.
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (picked.length === 0) return

    const rejected = picked.filter((f) => validateImage(f))
    for (const f of rejected) {
      toast.error(`${f.name}: ${validateImage(f)}`)
    }
    const accepted = picked.filter((f) => !validateImage(f))

    setImages((prev) => {
      const byName = new Map(prev.map((f) => [f.name, f]))
      for (const f of accepted) byName.set(f.name, f)
      return [...byName.values()]
    })
    clearServerErrors()
  }

  const removeImage = (name: string) => {
    setImages((prev) => prev.filter((f) => f.name !== name))
    clearServerErrors()
  }

  const tooManyImages = images.length > MAX_IMAGES
  const canSubmit = !!sheet && images.length > 0 && !tooManyImages && !loading

  const handleUpload = async () => {
    if (!sheet || images.length === 0 || tooManyImages) return

    setLoading(true)
    clearServerErrors()
    try {
      const fd = new FormData()
      fd.append("sheet", sheet)
      // same key repeated; name set explicitly since the server matches on it
      for (const img of images) fd.append("images", img, img.name)

      await hubService.bulkCreate(fd)

      toast.success(
        `${images.length} hub drop${images.length === 1 ? "" : "s"} created`
      )
      onSuccess()
      setOpen(false)
      reset()
    } catch (error) {
      const message = apiErrorMessage(error, "Bulk upload failed")
      const errors = bulkErrors(error)
      setServerMessage(message)
      setServerErrors(errors)
      if (errors.length === 0) toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // don't let the dialog close mid-upload — the request isn't idempotent
        if (loading) return
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Bulk upload</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk upload hub drops</DialogTitle>
          <DialogDescription>
            One spreadsheet row per drop. Each row's <code>image</code> column
            must match exactly one uploaded file name. All-or-nothing: if any
            row fails, nothing is saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Sheet</Label>
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleSheet}
            disabled={loading}
          />
          {sheet ? (
            <p className="text-xs">
              {sheet.name}{" "}
              <span className="text-muted-foreground">
                · {formatSize(sheet.size)}
              </span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              .xlsx, .xls or .csv · max 5 MB · first worksheet only. Required
              columns: <code>image</code>, <code>name</code>,{" "}
              <code>authorHandle</code>.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Images</Label>
          <Input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImages}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            PNG, JPEG or WEBP · max 2 MB each · 1–{MAX_IMAGES} files
          </p>

          {images.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={tooManyImages ? "text-destructive" : ""}>
                  {images.length} selected
                  {tooManyImages && ` — max ${MAX_IMAGES}`}
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                  onClick={() => {
                    setImages([])
                    clearServerErrors()
                  }}
                  disabled={loading}
                >
                  Clear all
                </button>
              </div>
              <ul className="max-h-40 overflow-y-auto rounded-md border divide-y text-xs">
                {images.map((img) => (
                  <li
                    key={img.name}
                    className="flex items-center justify-between gap-2 px-2 py-1"
                  >
                    <span className="truncate">{img.name}</span>
                    <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                      {formatSize(img.size)}
                      <button
                        type="button"
                        aria-label={`Remove ${img.name}`}
                        className="hover:text-foreground disabled:opacity-50"
                        onClick={() => removeImage(img.name)}
                        disabled={loading}
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {serverMessage && serverErrors.length > 0 && (
          <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">{serverMessage}</p>
            <ul className="max-h-48 space-y-1.5 overflow-y-auto text-xs">
              {groupByRow(serverErrors).map(([row, messages]) => (
                <li key={row ?? "request"}>
                  <span className="font-medium">
                    {row == null ? "General" : `Row ${row}`}
                  </span>
                  <ul className="ml-4 list-disc text-muted-foreground">
                    {messages.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={handleUpload} disabled={!canSubmit}>
          {loading
            ? `Uploading ${images.length} drop${images.length === 1 ? "" : "s"}...`
            : "Upload"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
