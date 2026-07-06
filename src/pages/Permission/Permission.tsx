import { useState } from 'react';
import { Box } from '@mui/material';
import type { UserPermission } from './types';

import PermissionHeader from './components/PermissionHeader';
import PermissionTable from './components/PermissionTable';

const MOCK_USERS: UserPermission[] = [
  { id: 'US001', username: 'minhxje.admin', fullName: 'Nguyễn Minh Hiếu', gateCode: 'ALL', role: 'ADMIN', canViewCamera: true, canApproveVehicle: true, canExportReport: true, canManageSystem: true, status: 'ACTIVE' },
  { id: 'US002', username: 'tran.b_manager', fullName: 'Trần Văn Bình', gateCode: 'GATE_01', role: 'MANAGER', canViewCamera: true, canApproveVehicle: true, canExportReport: true, canManageSystem: false, status: 'ACTIVE' },
  { id: 'US003', username: 'guard.le_01', fullName: 'Lê Hoàng Nam', gateCode: 'GATE_01', role: 'SECURITY_GUARD', canViewCamera: true, canApproveVehicle: true, canExportReport: false, canManageSystem: false, status: 'ACTIVE' },
  { id: 'US004', username: 'guard.nguyen_02', fullName: 'Nguyễn Văn Hùng', gateCode: 'GATE_02', role: 'SECURITY_GUARD', canViewCamera: true, canApproveVehicle: false, canExportReport: false, canManageSystem: false, status: 'INACTIVE' },
];

export default function PermissionPage() {
  const [users, setUsers] = useState<UserPermission[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handlePermissionChange = (userId: string, field: keyof UserPermission) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, [field]: !user[field] } : user
      )
    );
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: '5px', width: '100%' }}>
      <PermissionHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <PermissionTable 
        data={filteredUsers} 
        onPermissionChange={handlePermissionChange} 
      />
    </Box>
  );
}