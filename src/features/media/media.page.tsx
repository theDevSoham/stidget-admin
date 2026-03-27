import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { mediaService } from "./media.service";
import { UploadDialog } from "./upload-dialog";

import Button from "@/components/ui/button";
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
import type { MediaItem } from "@/types/media";
import type { MediaType } from "@/types/media";

export default function MediaPage({ type }: { type: MediaType }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mediaService.getAll(type);
      setMedia(data);
    } catch {
      toast.error("Failed to fetch " + type);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const handleDelete = async (id: string) => {
    try {
      await mediaService.delete(type, id);
      toast.success("Deleted");
      fetchMedia();
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [type]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold capitalize">{type}</h1>
        <UploadDialog type={type} onSuccess={fetchMedia} />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-sm text-muted-foreground">No {type} found</div>
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
            {media.map((media) => (
              <TableRow key={media.id}>
                <TableCell>
                  <img
                    src={media.imageUrl}
                    className="w-12 h-12 object-cover rounded-md border"
                  />
                </TableCell>

                <TableCell className="font-medium">{media.name}</TableCell>

                <TableCell className="text-muted-foreground">
                  {media.category}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {media.tags?.map((tag: string) => (
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
                  {media.isPremium ? (
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
                  <EditDialog
                    type={type}
                    media={media}
                    onSuccess={fetchMedia}
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {type}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the {type} "{media.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleDelete(media.id)}
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
