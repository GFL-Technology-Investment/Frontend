import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, MenuItem, Button, useTheme
} from '@mui/material';
import type { UserItem } from '../types';

export interface UserFormData {
  email: string;
  full_name: string;
  organization_id: string;
  role: string;
  is_active: boolean;
}

interface UserFormDialogProps {
  open: boolean;
  editUser: UserItem | null;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
}

const defaultFormState: UserFormData = {
  email: '',
  full_name: '',
  organization_id: 'org-001',
  role: 'GUARD',
  is_active: true
};

export default function UserFormDialog({ open, editUser, onClose, onSave }: UserFormDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState<UserFormData>(defaultFormState);

  // Sync dữ liệu khi bấm Sửa hoặc Tạo mới
  useEffect(() => {
    if (editUser) {
      setFormData({
        email: editUser.email,
        full_name: editUser.full_name || '',
        organization_id: editUser.organization_id || 'org-001',
        role: editUser.roles?.[0] || 'GUARD',
        is_active: editUser.is_active
      });
    } else {
      setFormData(defaultFormState);
    }
  }, [editUser, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '12px' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${theme.palette.customBg?.border || theme.palette.divider}`, pb: 2 }}>
        {editUser ? 'CẬP NHẬT THÔNG TIN TÀI KHOẢN' : 'TẠO MỚI TÀI KHOẢN NHÂN SỰ'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Họ và Tên"
                size="small"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Địa chỉ Email"
                size="small"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Mã Tổ chức (Organization ID)"
                size="small"
                required
                value={formData.organization_id}
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Vai trò chính (Role)"
                size="small"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="GUARD">GUARD</MenuItem>
                <MenuItem value="MANAGER">MANAGER</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Trạng thái"
                size="small"
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
              >
                <MenuItem value="true">Hoạt động</MenuItem>
                <MenuItem value="false">Tạm khóa</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.customBg?.border || theme.palette.divider}` }}>
          <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 'bold' }}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 'bold', px: 3 }}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}