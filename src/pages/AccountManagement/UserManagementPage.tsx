import { useState } from 'react';
import { Box } from '@mui/material';
import type { UserItem } from './types';

import UserHeader from './components/UserHeader';
import UserFilter from './components/UserFilter';
import UserTable from './components/UserTable';
import UserFormDialog from './components/UserFormDialog';
import UserDeleteDialog from './components/UserDeleteDialog';

const MOCK_USERS: UserItem[] = [
  { id: 'US001', username: 'minhxje.admin', fullName: 'Nguyễn Minh Hiếu', email: 'hieu.nm@airport.vn', phoneNumber: '0987654321', role: 'ADMIN', status: 'ACTIVE', createdAt: '15/01/2026' },
  { id: 'US002', username: 'tran.b_manager', fullName: 'Trần Văn Bình', email: 'binh.tv@airport.vn', phoneNumber: '0912345678', role: 'MANAGER', status: 'ACTIVE', createdAt: '20/02/2026' },
  { id: 'US003', username: 'guard.le_01', fullName: 'Lê Hoàng Nam', email: 'nam.lh@airport.vn', phoneNumber: '0933445566', role: 'SECURITY_GUARD', status: 'ACTIVE', createdAt: '05/03/2026' },
  { id: 'US004', username: 'guard.nguyen_02', fullName: 'Nguyễn Văn Hùng', email: 'hung.nv@airport.vn', phoneNumber: '0955667788', role: 'SECURITY_GUARD', status: 'INACTIVE', createdAt: '12/04/2026' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveUser = (formData: Omit<UserItem, 'id' | 'createdAt'>) => {
    if (editUser) {
      setUsers(users.map(u => u.id === editUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: UserItem = {
        ...formData,
        id: `US00${users.length + 1}`,
        createdAt: new Date().toLocaleDateString('vi-VN')
      };
      setUsers([...users, newUser]);
    }
    setOpenDialog(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      setUsers(users.filter(u => u.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3}, width: '100%' }}>
      <UserHeader onAddClick={() => { setEditUser(null); setOpenDialog(true); }} />
      
      <UserFilter value={searchTerm} onChange={setSearchTerm} />
      
      <UserTable 
        data={filteredUsers} 
        onEdit={(user) => { setEditUser(user); setOpenDialog(true); }} 
        onDelete={(id) => setDeleteTargetId(id)} 
      />

      <UserFormDialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        onSave={handleSaveUser} 
        editData={editUser} 
      />

      <UserDeleteDialog 
        open={Boolean(deleteTargetId)} 
        onClose={() => setDeleteTargetId(null)} 
        onConfirm={handleConfirmDelete} 
      />
    </Box>
  );
}