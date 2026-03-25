import { useEffect, useState } from "react";
import { toast } from "sonner";

import { stickersService } from "./stickers.service";
import { UploadDialog } from "./upload-dialog";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditDialog } from "./edit-dialog";

export default function StickersPage() {
  const [stickers, setStickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStickers = async () => {
    setLoading(true);
    try {
      const data = await stickersService.getAll();
      setStickers(data);
    } catch {
      toast.error("Failed to fetch stickers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await stickersService.delete(id);
      toast.success("Deleted");
      fetchStickers();
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchStickers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Stickers</h1>
        <UploadDialog onSuccess={fetchStickers} />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : stickers.length === 0 ? (
        <div className="text-sm text-muted-foreground">No stickers found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-left">Tags</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {stickers.map((sticker) => (
              <TableRow key={sticker.id}>
                <TableCell>
                  <img
                    src={sticker.imageUrl}
                    className="w-12 h-12 object-cover rounded-md border"
                  />
                </TableCell>

                <TableCell className="font-medium">{sticker.name}</TableCell>

                <TableCell className="text-muted-foreground">
                  {sticker.category}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {sticker.tags?.map((tag: string) => (
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
                  {sticker.isPremium ? (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Premium
                    </span>
                  ) : (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Free
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-right space-x-2">
                  <EditDialog sticker={sticker} onSuccess={fetchStickers} />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Sticker?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the sticker "{sticker.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleDelete(sticker.id)}
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
    </div>
  );
}
