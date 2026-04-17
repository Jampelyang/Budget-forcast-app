import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search,
  Mail,
  Building,
  ShieldAlert,
  Key,
  Plus,
  Info,
  ChevronRight,
  Settings2,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UserRoleName, DepartmentInfo, AppRole } from '../types';
import { AVAILABLE_PERMISSIONS } from '../constants';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  roles: AppRole[];
  setRoles: React.Dispatch<React.SetStateAction<AppRole[]>>;
  departments: DepartmentInfo[];
  addAuditLog: (action: string, details: string) => void;
  currentUser: User | null;
}

export function UserManager({ users, setUsers, roles, setRoles, departments, addAuditLog, currentUser }: UserManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff' as UserRoleName,
    departmentId: departments[0]?.id || ''
  });

  const [newRole, setNewRole] = useState<Partial<AppRole>>({
    name: '',
    description: '',
    permissions: []
  });

  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;

    const userToAdd: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      departmentId: newUser.role === 'Admin' ? undefined : newUser.departmentId,
      active: true,
      createdAt: new Date().toISOString()
    };

    setUsers([...users, userToAdd]);
    addAuditLog('Create User', `Created user: ${userToAdd.name} (${userToAdd.email}) with role ${userToAdd.role}`);
    setIsNewUserDialogOpen(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'Staff',
      departmentId: departments[0]?.id || ''
    });
  };

  const handleAddRole = () => {
    if (!newRole.name || !newRole.description) return;

    const roleToAdd: AppRole = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions || []
    };

    setRoles([...roles, roleToAdd]);
    addAuditLog('Create Role', `Created new system role: ${roleToAdd.name}`);
    setIsNewRoleDialogOpen(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const handleDeleteRole = (id: string) => {
    const roleToRemove = roles.find(r => r.id === id);
    if (!roleToRemove) return;
    
    if (roleToRemove.isSystem) {
      alert("System roles cannot be deleted.");
      return;
    }

    // Check if users are assigned to this role
    const usersWithRole = users.filter(u => u.role === roleToRemove.name);
    if (usersWithRole.length > 0) {
      alert(`Cannot delete role. It is currently assigned to ${usersWithRole.length} users.`);
      return;
    }

    setRoles(roles.filter(r => r.id !== id));
    addAuditLog('Delete Role', `Deleted role: ${roleToRemove.name}`);
  };

  const togglePermission = (perm: string) => {
    setNewRole(prev => {
      const currentPerms = prev.permissions || [];
      if (currentPerms.includes(perm)) {
        return { ...prev, permissions: currentPerms.filter(p => p !== perm) };
      } else {
        return { ...prev, permissions: [...currentPerms, perm] };
      }
    });
  };

  const handleDeleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;
    
    // Safety check: Don't delete self (jampel91@gmail.com)
    if (userToDelete.email === 'jampel91@gmail.com') {
      alert("Cannot delete primary administrator.");
      return;
    }

    setUsers(users.filter(u => u.id !== id));
    addAuditLog('Delete User', `Deleted user: ${userToDelete.name} (${userToDelete.email})`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const newStatus = !u.active;
        addAuditLog('Update User', `Changed status of ${u.name} to ${newStatus ? 'Active' : 'Inactive'}`);
        return { ...u, active: newStatus };
      }
      return u;
    }));
  };

  const handleChangeOwnPassword = () => {
    if (!currentUser) return;
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (passwordChange.currentPassword !== currentUser.password) {
      alert("Current password is incorrect.");
      return;
    }

    setUsers(users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, password: passwordChange.newPassword };
      }
      return u;
    }));

    addAuditLog('Security', `User ${currentUser.name} changed their password`);
    setIsChangePasswordDialogOpen(false);
    setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="directory" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList className="bg-[#141414]/5 border border-[#141414]/10 p-1 rounded-xl">
            <TabsTrigger value="directory" className="rounded-lg data-[state=active]:bg-[#141414] data-[state=active]:text-white">
              User Directory
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-lg data-[state=active]:bg-[#141414] data-[state=active]:text-white">
              Role Definitions
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-[#141414] data-[state=active]:text-white">
              My Profile
            </TabsTrigger>
          </TabsList>

          <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#141414] hover:bg-[#141414]/90 gap-2 w-full md:w-auto shadow-lg">
                <UserPlus size={18} />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new account for institution staff or management.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Full Name</label>
                  <Input 
                    placeholder="John Doe" 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="border-[#141414]/10 h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="john@microfinance.com" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="border-[#141414]/10 h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Initial Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/30" size={16} />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="pl-9 border-[#141414]/10 h-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Role</label>
                    <Select 
                      onValueChange={(value: UserRoleName) => setNewUser({...newUser, role: value})} 
                      defaultValue={newUser.role}
                    >
                      <SelectTrigger className="border-[#141414]/10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Department</label>
                    <Select 
                      onValueChange={(value) => setNewUser({...newUser, departmentId: value})}
                      disabled={['Admin'].includes(newUser.role)}
                      defaultValue={newUser.departmentId}
                    >
                      <SelectTrigger className="border-[#141414]/10">
                        <SelectValue placeholder="Select dept" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewUserDialogOpen(false)}
                  className="border-[#141414]/10"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUser} className="bg-[#141414] hover:bg-[#141414]/90">
                  Create Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="directory" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" size={18} />
              <Input 
                placeholder="Search users by name or email..." 
                className="pl-10 border-[#141414]/10 focus-visible:ring-[#141414] bg-white rounded-xl h-11 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="border-[#141414]/10 shadow-sm relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-2 border-b border-[#141414]/5 mb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users size={18} className="text-[#141414]/60" />
                System Users
              </CardTitle>
              <CardDescription className="font-serif italic text-xs">Manage active accounts and access levels</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#141414]/5 bg-[#141414]/5 hover:bg-[#141414]/5">
                      <TableHead className="font-bold py-4">User Details</TableHead>
                      <TableHead className="font-bold py-4">Assignment</TableHead>
                      <TableHead className="font-bold py-4">Status</TableHead>
                      <TableHead className="text-right font-bold py-4">Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-[#141414]/5 group hover:bg-[#141414]/5">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.role === 'Admin' ? 'bg-[#141414] text-white shadow-lg' : 'bg-[#141414]/10 text-[#141414]'}`}>
                              {user.role === 'Admin' ? <ShieldAlert size={20} /> : <Users size={20} />}
                            </div>
                            <div>
                              <p className="font-bold text-sm tracking-tight">{user.name}</p>
                              <p className="text-xs text-[#141414]/40 font-mono">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] uppercase font-bold tracking-widest px-2 ${
                                user.role === 'Admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                                user.role === 'Manager' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                'bg-green-50 text-green-700 border-green-100'
                              }`}
                            >
                              {user.role}
                            </Badge>
                            {user.departmentId && (
                              <p className="text-xs text-[#141414]/60 flex items-center gap-1 font-serif italic">
                                <Building size={10} /> {departments.find(d => d.id === user.departmentId)?.name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <button 
                            onClick={() => toggleUserStatus(user.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                              user.active 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-[#141414]/5 text-[#141414]/40 border border-[#141414]/10'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-green-500 animate-pulse' : 'bg-[#141414]/20'}`} />
                            {user.active ? 'Active Access' : 'Suspended'}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map(role => (
                  <Card key={role.id} className="border-[#141414]/10 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden group">
                    <CardHeader className="pb-3 bg-[#141414]/5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-[#141414] text-white rounded-lg">
                            <Shield size={16} />
                          </div>
                          <CardTitle className="text-lg font-bold tracking-tight">{role.name}</CardTitle>
                        </div>
                        {!role.isSystem && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                      <CardDescription className="text-xs font-serif italic">{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-1">
                          <ShieldCheck size={10} /> Active Permissions
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions.map(p => (
                            <Badge key={p} className="bg-[#141414]/5 text-[#141414] border-[#141414]/10 text-[10px] capitalize hover:bg-[#141414] hover:text-white transition-colors cursor-default">
                              {p.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="border-2 border-dashed border-[#141414]/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-[#141414]/5 hover:border-[#141414]/20 transition-all text-[#141414]/40 hover:text-[#141414]">
                      <Plus size={32} />
                      <div className="text-center">
                        <p className="font-bold text-sm">Create New Role</p>
                        <p className="text-[10px] font-serif italic">Define custom permission scope</p>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Define New Security Role</DialogTitle>
                      <DialogDescription>Custom roles allow precise control over internal data access.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Role Identification</label>
                          <Input 
                            placeholder="Operational Lead" 
                            value={newRole.name}
                            onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Scope Description</label>
                          <Input 
                            placeholder="Handles daily lending limits..." 
                            value={newRole.description}
                            onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Available Permissions</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {AVAILABLE_PERMISSIONS.map(perm => (
                            <button
                              key={perm}
                              onClick={() => togglePermission(perm)}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                                newRole.permissions?.includes(perm)
                                  ? 'bg-[#141414] text-white border-[#141414] shadow-md'
                                  : 'bg-[#141414]/5 text-[#141414]/60 border-transparent hover:border-[#141414]/20'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${newRole.permissions?.includes(perm) ? 'border-white' : 'border-[#141414]/20'}`}>
                                {newRole.permissions?.includes(perm) && <CheckCircle2 size={10} />}
                              </div>
                              <span className="text-[10px] font-bold capitalize">{perm.replace('_', ' ')}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsNewRoleDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddRole} className="bg-[#141414] hover:bg-[#141414]/90">Deploy Role</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-[#141414] text-white rounded-2xl overflow-hidden relative border-none">
                <CardHeader className="relative z-10 pb-0">
                  <Badge className="bg-white/20 text-white border-white/10 w-fit">RBAC SECURITY</Badge>
                  <CardTitle className="text-xl mt-4">Security Inheritance</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4 pt-4">
                  <p className="text-xs text-white/60 font-serif italic leading-relaxed">
                    System roles (Admin) are immutable. Custom roles inherit baseline data safety protocols but can be tailored to departmental silos.
                  </p>
                  <div className="flex gap-2">
                    <ShieldAlert size={40} className="text-white/20" />
                    <Info size={40} className="text-white/20" />
                  </div>
                </CardContent>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              </Card>

              <div className="p-6 bg-white border border-[#141414]/10 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                  <Settings2 size={16} className="text-[#141414]/60" />
                  Policy Overview
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Role Limit', value: 'Unlimited' },
                    { label: 'Default Role', value: 'Staff' },
                    { label: 'Permission Type', value: 'Granular' },
                  ].map(stat => (
                    <div key={stat.label} className="flex justify-between items-center pb-2 border-b border-[#141414]/5">
                      <span className="text-xs text-[#141414]/40">{stat.label}</span>
                      <span className="font-mono text-[10px] font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="text-center p-8 bg-white border border-[#141414]/10 rounded-3xl shadow-sm relative overflow-hidden group">
                  <div className="w-24 h-24 bg-[#141414] text-white rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover:rotate-12 duration-500">
                    <Users size={40} />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight">{currentUser?.name}</h3>
                  <p className="text-[#141414]/40 text-xs mb-4">{currentUser?.email}</p>
                  <Badge className="bg-[#141414]/5 text-[#141414] border-[#141414]/10 px-4 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest">{currentUser?.role}</Badge>
                  
                  <div className="mt-8 flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-[#141414]/30">Member Since</p>
                      <p className="text-xs font-bold">{currentUser ? new Date(currentUser.createdAt).getFullYear() : '2024'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#141414] text-white rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock size={18} className="text-white/40" />
                    <span className="font-bold text-sm tracking-tight">Security Status</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white/10 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-xs font-medium">Session Active & Secure</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-serif italic">Last login: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <Card className="border-[#141414]/10 shadow-sm rounded-3xl overflow-hidden bg-white">
                  <CardHeader className="border-b border-[#141414]/5 bg-[#F5F5F4]/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key size={18} className="text-[#141414]/60" />
                      Security Credentials
                    </CardTitle>
                    <CardDescription className="italic font-serif text-xs">Update your portal access password</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Current Password</label>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="h-11 border-[#141414]/10 focus-visible:ring-0 focus-visible:border-[#141414] rounded-xl"
                          value={passwordChange.currentPassword}
                          onChange={(e) => setPasswordChange({...passwordChange, currentPassword: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">New Password</label>
                          <Input 
                            type="password" 
                            placeholder="Min. 8 chars" 
                            className="h-11 border-[#141414]/10 focus-visible:ring-0 focus-visible:border-[#141414] rounded-xl"
                            value={passwordChange.newPassword}
                            onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Confirm New</label>
                          <Input 
                            type="password" 
                            placeholder="Repeat password" 
                            className="h-11 border-[#141414]/10 focus-visible:ring-0 focus-visible:border-[#141414] rounded-xl"
                            value={passwordChange.confirmPassword}
                            onChange={(e) => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button 
                        onClick={handleChangeOwnPassword}
                        className="bg-[#141414] hover:bg-[#141414]/90 text-white rounded-xl h-11 px-8 gap-2 shadow-lg"
                      >
                        Update Security Keys
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-8 bg-[#F5F5F4]/50 border border-dashed border-[#141414]/10 rounded-3xl flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#141414]/20 border border-[#141414]/5">
                    <Shield size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm tracking-tight text-[#141414]/80">Two-Factor Authentication</h4>
                    <p className="text-xs text-[#141414]/40 font-serif italic">Additional security layers can be configured by departmental IT leads.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
