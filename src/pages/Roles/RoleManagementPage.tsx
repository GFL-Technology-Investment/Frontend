import { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert, Paper, InputAdornment, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RoleTable from './RoleTable';
import RoleFormDialog from './RoleFormDialog';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import axiosInstance from '../../configs/axios';
import type { RoleItem, RoleListResponse } from './role';

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // 1. GET: /api/v1/roles
  const fetchRoles = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axiosInstance.get<RoleListResponse>('/api/v1/roles');
      const data = response.data.roles || [];
      setRoles(data);
      setTotal(data.length);
    } catch (err: any) {
      console.error('Lỗi lấy danh sách vai trò:', err);
      setErrorMsg(err.response?.data?.detail || 'Không thể tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // 2. POST / PATCH: Thêm mới hoặc Cập nhật
  const handleSaveRole = async (payload: any) => {
    try {
      if (editingRole) {
        // PATCH: /api/v1/roles/{role_id}
        await axiosInstance.patch(`/api/v1/roles/${editingRole.role_id}`, payload);
      } else {
        // POST: /api/v1/roles
        await axiosInstance.post('/api/v1/roles', payload);
      }
      await fetchRoles();
    } catch (err: any) {
      console.error('Lỗi lưu thông tin vai trò:', err);
      const msg = err.response?.data?.detail || 'Lưu thông tin thất bại!';
      setErrorMsg(msg);
      throw err;
    }
  };

  // 3. DELETE: /api/v1/roles/{role_id}
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/api/v1/roles/${deleteTargetId}`);
      setDeleteTargetId(null);
      await fetchRoles();
    } catch (err: any) {
      console.error('Lỗi xóa vai trò:', err);
      setErrorMsg(err.response?.data?.detail || 'Không thể xóa vai trò này');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Tìm kiếm theo role_code hoặc role_name
  const filteredRoles = roles.filter(
    (r) =>
      r.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            QUẢN LÝ VAI TRÒ & QUYỀN
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Quản lý danh sách vai trò và phân quyền trong hệ thống
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary" // Dùng primary thay vì secondary để khớp với tông màu chủ đạo của hệ thống
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingRole(null);
            setOpenFormDialog(true);
          }}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: (theme) => theme.shadows[2],
            }
          }}
        >
          Thêm vai trò
        </Button>
      </Box>

      {/* Alert Error */}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Search Bar */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 3, 
          bgcolor: 'background.paper',
          border: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <TextField
          placeholder="Tìm theo mã (role_code) hoặc tên vai trò..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            width: { xs: '100%', sm: 360 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      {/* Table */}
      <RoleTable
        roles={filteredRoles}
        total={total}
        page={page}
        limit={limit}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onEditClick={(role) => {
          setEditingRole(role);
          setOpenFormDialog(true);
        }}
        onDeleteClick={(id) => setDeleteTargetId(id)}
      />

      {/* Form Dialog */}
      <RoleFormDialog
        open={openFormDialog}
        editRole={editingRole}
        onClose={() => setOpenFormDialog(false)}
        onSave={handleSaveRole}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTargetId)}
        targetId={deleteTargetId}
        loading={deleteLoading}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}