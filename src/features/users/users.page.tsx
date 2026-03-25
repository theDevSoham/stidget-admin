import { useEffect, useState } from "react";
import { toast } from "sonner";

import { usersService } from "./users.service";
import { UserDetailsDialog } from "./user-details-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersService.getAll();
      setUsers(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-sm text-muted-foreground">No users found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>

                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {user.role}
                  </span>
                </TableCell>

                <TableCell>
                  {user.isEmailVerified ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Pending
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <UserDetailsDialog userId={user.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {meta && (
        <div className="text-sm text-muted-foreground">
          Showing {users.length} of {meta.total} users
        </div>
      )}
    </div>
  );
}
