import { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert, Paper, InputAdornment, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import OrganizationTable from './OrganizationTable';
import OrganizationFormDialog from './OrganizationFormDialog';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog'; // Có thể dùng lại Dialog xóa từ trang User
import axiosInstance from '../../configs/axios'; // Axios đã cấu hình baseURL và token
import type { OrganizationItem, OrganizationListResponse } from './Organization';

export default function OrganizationManagementPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationItem | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // 1. Lấy danh sách tổ chức: GET /api/v1/organizations?page=1&limit=20
  const fetchOrganizations = async (currentPage = page, currentLimit = limit) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axiosInstance.get<OrganizationListResponse>('/api/v1/organizations', {
        params: {
          page: currentPage,
          limit: currentLimit,
        },
      });

      setOrganizations(response.data.organizations || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      console.error('Lỗi lấy danh sách tổ chức:', err);
      setErrorMsg(err.response?.data?.detail || 'Không thể tải danh sách tổ chức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations(page, limit);
  }, [page, limit]);

  // 2. Thêm mới hoặc Cập nhật
  const handleSaveOrganization = async (payload: any) => {
    try {
      if (editingOrg) {
        // patch /api/v1/organizations/{organization_id}
        await axiosInstance.patch(`/api/v1/organizations/${editingOrg.organization_id}`, payload);
      } else {
        // POST /api/v1/organizations
        await axiosInstance.post('/api/v1/organizations', payload);
      }
      await fetchOrganizations(page, limit);
    } catch (err: any) {
      console.error('Lỗi lưu thông tin tổ chức:', err);
      const msg = err.response?.data?.detail || 'Lưu thông tin thất bại!';
      setErrorMsg(msg);
      throw err;
    }
  };

  // 3. Xóa tổ chức: DELETE /api/v1/organizations/{organization_id}
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/api/v1/organizations/${deleteTargetId}`);
      setDeleteTargetId(null);
      await fetchOrganizations(page, limit);
    } catch (err: any) {
      console.error('Lỗi xóa tổ chức:', err);
      setErrorMsg(err.response?.data?.detail || 'Không thể xóa tổ chức');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Lọc client-side nhanh theo từ khóa tìm kiếm
  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organization_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            QUẢN LÝ TỔ CHỨC
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các chi nhánh, tổ chức thuộc hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingOrg(null);
            setOpenFormDialog(true);
          }}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
        >
          Thêm tổ chức
        </Button>
      </Box>

      {/* Thông báo Lỗi nếu có */}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Thanh tìm kiếm */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <TextField
          placeholder="Tìm theo tên hoặc mã tổ chức (org-id)..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', sm: 350 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      {/* Bảng dữ liệu */}
      <OrganizationTable
        organizations={filteredOrganizations}
        total={total}
        page={page}
        limit={limit}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onEditClick={(org) => {
          setEditingOrg(org);
          setOpenFormDialog(true);
        }}
        onDeleteClick={(id) => setDeleteTargetId(id)}
      />

      {/* Dialog Form Thêm / Sửa */}
      <OrganizationFormDialog
        open={openFormDialog}
        editOrg={editingOrg}
        onClose={() => setOpenFormDialog(false)}
        onSave={handleSaveOrganization}
      />

      {/* Dialog Xác nhận xóa */}
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