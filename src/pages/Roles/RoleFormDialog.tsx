import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, useTheme
} from '@mui/material';
import type { RoleItem } from './role';

interface RoleFormDialogProps {
  open: boolean;
  editRole: RoleItem | null;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

export default function RoleFormDialog({
  open, editRole, onClose, onSave
}: RoleFormDialogProps) {
  const theme = useTheme();

  const [roleCode, setRoleCode] = useState<string>('');
  const [roleName, setRoleName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editRole) {
      setRoleCode(editRole.role_code || '');
      setRoleName(editRole.role_name || '');
      setDescription(editRole.description || '');
    } else {
      setRoleCode('');
      setRoleName('');
      setDescription('');
    }
  }, [editRole, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editRole) {
        // Body PATCH cho cập nhật (chỉ truyền role_name, description)
        await onSave({
          role_name: roleName.trim(),
          description: description.trim(),
        });
      } else {
        // Body POST cho thêm mới (truyền role_code, role_name, description)
        await onSave({
          role_code: roleCode.trim().toUpperCase(),
          role_name: roleName.trim(),
          description: description.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu vai trò:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
      <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
        {editRole ? 'CẬP NHẬT VAI TRÒ' : 'TẠO MỚI VAI TRÒ'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            {/* Role Code */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mã Vai Trò (role_code)"
                placeholder="VD: ADMIN, GUARD, STAFF"
                size="small"
                required
                disabled={Boolean(editRole)} // Khóa không cho sửa role_code khi cập nhật
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value)}
              />
            </Grid>

            {/* Role Name */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Tên Vai Trò (role_name)"
                placeholder="VD: Bảo vệ trực cổng"
                size="small"
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mô tả"
                placeholder="Nhập mô tả cho vai trò..."
                size="small"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={submitting} sx={{ borderRadius: '6px' }}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="contained" color="primary" loading={submitting} sx={{ borderRadius: '6px', px: 3 }}>
            {editRole ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}