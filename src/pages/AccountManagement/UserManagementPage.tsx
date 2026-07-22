import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, useTheme, TextField, InputAdornment,
  TablePagination, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

import axiosInstance from '../../configs/axios';
import UserTable from './components/UserTable';
import UserFormDialog, { type UserFormData } from './components/UserFormDialog';
import ConfirmDeleteDialog from './components/ConfirmDeleteDialog';
import type { UserItem, UserListResponse } from './types';

export default function UserManagementPage() {
  const theme = useTheme();

  // State Dữ liệu API
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State Phân trang & Tìm kiếm
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // State Quản lý Modals
  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Gọi API lấy danh sách User
  const fetchUsers = useCallback(async (currentPage: number, limit: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axiosInstance.get<UserListResponse>(
        `/api/v1/list/user?page=${currentPage + 1}&limit=${limit}`
      );
      if (response.data) {
        setUsers(response.data.users || []);
        setTotal(response.data.total || 0);
      }
    } catch (err: any) {
      console.error('Lỗi fetch user:', err);
      setErrorMsg(err.response?.data?.detail || 'Không thể tải danh sách tài khoản!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, rowsPerPage);
  }, [fetchUsers, page, rowsPerPage]);

  // Handlers Phân trang
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handlers Mở Form
  const handleOpenAdd = () => {
    setEditUser(null);
    setOpenFormDialog(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditUser(user);
    setOpenFormDialog(true);
  };

  // Handlers Thêm/Sửa & Xóa
  const handleSaveUser = (formData: UserFormData) => {
    if (editUser) {
      setUsers(users.map(u => u.user_id === editUser.user_id ? {
        ...u,
        email: formData.email,
        full_name: formData.full_name,
        organization_id: formData.organization_id,
        roles: [formData.role],
        is_active: formData.is_active
      } : u));
    } else {
      const newUser: UserItem = {
        user_id: `user-${Date.now()}`,
        email: formData.email,
        full_name: formData.full_name,
        organization_id: formData.organization_id,
        is_active: formData.is_active,
        roles: [formData.role],
        permissions: [],
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setUsers([newUser, ...users]);
    }
    setOpenFormDialog(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      setUsers(users.filter(u => u.user_id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* HEADER PHÂN HỆ */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase' }}>
            <AccountCircleIcon color="primary" /> Quản lý danh sách tài khoản
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Quản lý hồ sơ, cấp phát tài khoản đăng nhập và phân vai trò hoạt động ({total} tài khoản).
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchUsers(page, rowsPerPage)}
            disabled={loading}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: '8px', fontWeight: 'bold', textTransform: 'none', px: 3 }}
          >
            Tạo tài khoản
          </Button>
        </Box>
      </Box>

      {/* TÌM KIẾM */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Nhập ID, họ tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: { xs: '100%', sm: 400 },
            bgcolor: theme.palette.customBg?.card || 'background.paper',
            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }
          }}
        />
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* USER TABLE */}
      <UserTable
        users={filteredUsers}
        loading={loading}
        onEditClick={handleOpenEdit}
        onDeleteClick={(id) => setDeleteTargetId(id)}
      />

      {/* PAGINATION */}
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng/trang:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong tổng số ${count}`}
      />

      {/* FORM DIALOG (THÊM / SỬA) */}
      <UserFormDialog
        open={openFormDialog}
        editUser={editUser}
        onClose={() => setOpenFormDialog(false)}
        onSave={handleSaveUser}
      />

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTargetId)}
        targetId={deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}