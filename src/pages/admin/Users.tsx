import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'cashier' | 'cook' | 'staff' | 'user';
  created_at: string;
}

interface UserWithRole extends Profile {
  user_roles: UserRole[];
}

interface RoleDescription {
  role: string;
  display_name: string;
  description: string;
  permissions: string[];
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'destructive',
  manager: 'default',
  cashier: 'secondary',
  cook: 'outline',
  staff: 'outline',
  user: 'outline',
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('user');

  // Fetch all users with their roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_roles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserWithRole[];
    },
  });

  // Fetch role descriptions
  const { data: roleDescriptions = [] } = useQuery({
    queryKey: ['role-descriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_descriptions')
        .select('*')
        .order('role');

      if (error) throw error;
      return data as RoleDescription[];
    },
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // First, check if user already has this role
      const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (existing) {
        throw new Error('User already has this role');
      }

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role assigned successfully');
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error('Failed to assign role: ' + error.message);
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove role: ' + error.message);
    },
  });

  const openDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setSelectedRole('user');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleAssignRole = () => {
    if (!selectedUser) return;
    assignRoleMutation.mutate({ userId: selectedUser.id, role: selectedRole });
  };

  const handleRemoveRole = (roleId: string) => {
    if (window.confirm('Are you sure you want to remove this role?')) {
      removeRoleMutation.mutate(roleId);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleDisplayName = (role: string) => {
    const desc = roleDescriptions.find((r) => r.role === role);
    return desc?.display_name || role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and role assignments</p>
          </div>
        </div>

        {/* Role Descriptions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roleDescriptions.map((role) => (
            <Card key={role.role} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {role.display_name}
                </h3>
                <Badge variant={ROLE_COLORS[role.role] as any}>{role.role}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map((perm) => (
                  <Badge key={perm} variant="outline" className="text-xs">
                    {perm.replace('_', ' ')}
                  </Badge>
                ))}
                {role.permissions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{role.permissions.length - 3} more
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{user.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.user_roles.length === 0 ? (
                          <Badge variant="outline">No roles</Badge>
                        ) : (
                          user.user_roles.map((userRole) => (
                            <Badge
                              key={userRole.id}
                              variant={ROLE_COLORS[userRole.role] as any}
                              className="cursor-pointer"
                              onClick={() => handleRemoveRole(userRole.id)}
                              title="Click to remove role"
                            >
                              {getRoleDisplayName(userRole.role)} ×
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(user)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Assign Role Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
              <DialogDescription>
                Assign a new role to {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Current Roles */}
              {selectedUser && selectedUser.user_roles.length > 0 && (
                <div>
                  <Label>Current Roles</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUser.user_roles.map((userRole) => (
                      <Badge key={userRole.id} variant={ROLE_COLORS[userRole.role] as any}>
                        {getRoleDisplayName(userRole.role)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* New Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Select Role to Assign</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleDescriptions.map((role) => (
                      <SelectItem key={role.role} value={role.role}>
                        <div className="flex items-center gap-2">
                          <span>{role.display_name}</span>
                          <Badge variant={ROLE_COLORS[role.role] as any} className="text-xs">
                            {role.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRole && (
                  <p className="text-sm text-muted-foreground">
                    {roleDescriptions.find((r) => r.role === selectedRole)?.description}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignRole}
                disabled={assignRoleMutation.isPending || !selectedRole}
              >
                {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
