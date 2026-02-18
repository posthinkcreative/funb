"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserProfile } from "@/types"
import { ArrowUpDown, MoreHorizontal, Shield, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateUserRole, deleteUser } from "@/actions/users"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/firebase"

const RoleCell = ({ row }: { row: any }) => {
    const role = row.original.role;
    const variant = role === "admin" ? "default" : "secondary";
    const Icon = role === "admin" ? ShieldCheck : Shield;
    return (
        <Badge variant={variant} className="capitalize">
            <Icon className="mr-1 h-3 w-3" />
            {role}
        </Badge>
    );
};

const UserCell = ({ row }: { row: any }) => {
    const user = row.original;
    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1 && names[1]) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2);
    };

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="font-medium">{user.name || 'No Name'}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
        </div>
    );
};

// A new component for the actions cell to correctly use hooks
function ActionsCell({ user: targetUser }: { user: UserProfile }) {
    const { toast } = useToast();
    const { user: currentUser } = useUser();

    const isSelf = currentUser?.uid === targetUser.uid;

    const handleRoleChange = async (newRole: 'admin' | 'customer') => {
        if (!targetUser.uid) return;

        const result = await updateUserRole(targetUser.uid, newRole);

        if (result.success) {
            toast({
                title: "Role Updated",
                description: `${targetUser.name || targetUser.email}'s role has been changed to ${newRole}.`,
            });
        } else {
            toast({
                title: "Update Failed",
                description: result.error,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!targetUser.uid) return;

        const result = await deleteUser(targetUser.uid);

        if (result.success) {
            toast({
                title: "User Deleted",
                description: `${targetUser.name || targetUser.email} has been permanently deleted.`,
            });
        } else {
             toast({
                title: "Deletion Failed",
                description: result.error,
                variant: "destructive",
            });
        }
    };

    return (
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {targetUser.role !== 'admin' && (
                        <DropdownMenuItem onClick={() => handleRoleChange('admin')} disabled={isSelf}>
                            Make Admin
                        </DropdownMenuItem>
                    )}
                    {targetUser.role === 'admin' && (
                        <DropdownMenuItem onClick={() => handleRoleChange('customer')} disabled={isSelf}>
                            Make Customer
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            disabled={isSelf}
                            onSelect={(e) => e.preventDefault()}
                        >
                            Delete User
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the account for{' '}
                  <strong>{targetUser.name || targetUser.email}</strong> and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export const columns: ColumnDef<UserProfile>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: UserCell
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: RoleCell
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <ActionsCell user={user} />;
    },
  },
]
