import { useEffect, useState } from "react"
import { toast } from "sonner"

import { hubService } from "./hub.service"
import { UploadDialog } from "./upload-dialog"
import { EditDialog } from "./edit-dialog"

import Button from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { apiErrorMessage } from "@/lib/api-error"
import type { HubItem } from "@/types/hub"

export default function HubPage() {
  const [items, setItems] = useState<HubItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await hubService.getAll({ limit: 100 })
      setItems(res.data)
      setTotal(res.meta?.total ?? res.data.length)
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to fetch hub drops"))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await hubService.delete(id)
      toast.success("Deleted")
      fetchItems()
    } catch (error) {
      toast.error(apiErrorMessage(error, "Delete failed"))
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Hub</h1>
        <UploadDialog onSuccess={fetchItems} />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No hub drops found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <img
                    src={item.imageUrl}
                    className="w-12 h-12 object-cover rounded-md border"
                    style={item.bg ? { backgroundColor: item.bg } : undefined}
                  />
                </TableCell>

                <TableCell className="font-medium">{item.name}</TableCell>

                <TableCell className="text-muted-foreground">
                  {item.author?.handle}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {item.category ?? "-"}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-muted px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </TableCell>

                <TableCell>
                  {item.isPremium ? (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Premium
                    </span>
                  ) : (
                    <span className="text-xs bg-muted px-2 py-1 rounded">Free</span>
                  )}
                </TableCell>

                <TableCell className="text-right space-x-2">
                  <EditDialog
                    id={item.id}
                    imageUrl={item.imageUrl}
                    onSuccess={fetchItems}
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete hub drop?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This soft-deletes "{item.name}" — it disappears from the
                          mobile hub, but the image is not purged and existing
                          owners keep it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && items.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {items.length} of {total} drops
        </div>
      )}
    </div>
  )
}
