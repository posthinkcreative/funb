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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateUserRole } from "@/actions/users"
import { useToast } from "@/hooks/use-toast"

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
function ActionsCell({ user }: { user: UserProfile }) {
    const { toast } = useToast();

    const handleRoleChange = async (newRole: 'admin' | 'customer') => {
        if (!user.uid) return;

        const result = await updateUserRole(user.uid, newRole);

        if (result.success) {
            toast({
                title: "Role Updated",
                description: `${user.name || user.email}'s role has been changed to ${newRole}.`,
            });
        } else {
            toast({
                title: "Update Failed",
                description: result.error,
                variant: "destructive",
            });
        }
    };

    return (
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
                {user.role !== 'admin' && (
                    <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
                        Make Admin
                    </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => handleRoleChange('customer')}>
                        Make Customer
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
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
