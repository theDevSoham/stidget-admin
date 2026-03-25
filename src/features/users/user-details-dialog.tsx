import { useCallback, useEffect, useState } from "react";
import { usersService } from "./users.service";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "@/lib/dayjs";
import type { User } from "@/types/user";

export function UserDetailsDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.getById(userId);
      setUser(res.data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) fetchUser();
  }, [open, fetchUser]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          View
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : user ? (
          <div className="space-y-2 text-sm">
            <Detail label="ID" value={user.id} />
            <Detail label="Full Name" value={user.fullName} />
            <Detail label="Email" value={user.email} />
            <Detail label="Phone" value={user.phone || "-"} />
            <Detail label="Role" value={user.role} />
            <Detail
              label="Email Verified"
              value={user.isEmailVerified ? "Yes" : "No"}
            />
            <Detail
              label="Created"
              value={dayjs(user.createdAt).format("DD MMM YYYY, HH:mm")}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </div>
  );
}
