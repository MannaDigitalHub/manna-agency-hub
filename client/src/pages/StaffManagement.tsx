import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Shield, Users, Settings } from 'lucide-react';

const roles = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all features and settings',
    permissions: ['View All', 'Create', 'Edit', 'Delete', 'Manage Staff', 'View Reports', 'Manage Billing'],
    color: 'bg-red-100 text-red-800',
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage projects, leads, and team members',
    permissions: ['View All', 'Create', 'Edit', 'Manage Team', 'View Reports'],
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Can manage leads and customer interactions',
    permissions: ['View Assigned', 'Edit Assigned', 'Create Leads', 'View Reports'],
    color: 'bg-green-100 text-green-800',
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to reports and dashboards',
    permissions: ['View Reports', 'View Dashboard'],
    color: 'bg-gray-100 text-gray-800',
  },
];

const staffMembers = [
  {
    id: 1,
    name: 'Themba Mthembu',
    email: 'themba@manna.co.za',
    role: 'admin',
    status: 'active',
    joinDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Lerato Nkosi',
    email: 'lerato@manna.co.za',
    role: 'manager',
    status: 'active',
    joinDate: '2024-02-01',
  },
  {
    id: 3,
    name: 'Sipho Dlamini',
    email: 'sipho@manna.co.za',
    role: 'agent',
    status: 'active',
    joinDate: '2024-02-15',
  },
];

export default function StaffManagement() {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'agent' });

  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-2">Manage your team and control access permissions</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddStaff(!showAddStaff)}>
          <Plus className="w-4 h-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Add Staff Form */}
      {showAddStaff && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h2 className="text-xl font-bold text-foreground mb-4">Add New Staff Member</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Full Name"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            />
            <Input
              placeholder="Email Address"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            />
            <select
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Invite
            </Button>
          </div>
        </Card>
      )}

      {/* Current Staff */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staffMembers.map((member) => (
                <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{member.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{member.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge className={getRoleColor(member.role)}>
                      {roles.find(r => r.id === member.role)?.name}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{member.joinDate}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="gap-1">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1 text-red-600">
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Roles & Permissions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Roles & Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs">
                      ✓ {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Best Practices for Staff Management
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Assign the minimum role necessary for each staff member</li>
          <li>✓ Review staff permissions quarterly</li>
          <li>✓ Remove access immediately when staff leaves</li>
          <li>✓ Use Admin role only for trusted leadership</li>
          <li>✓ Monitor activity logs for security</li>
          <li>✓ Enable two-factor authentication for Admin accounts</li>
        </ul>
      </Card>
    </div>
  );
}
