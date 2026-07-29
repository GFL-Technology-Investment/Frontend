import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, MenuItem, Button, FormControlLabel,
  Switch, useTheme, CircularProgress
} from '@mui/material';
import type { UserItem } from '../types';

export interface UserFormData {
  email: string;
  password?: string;
  full_name: string;
  organization_id: string;
  role_codes: string[];
  is_active: boolean;
}

interface UserFormDialogProps {
  open: boolean;
  editUser: UserItem | null;
  rolesList: string[];            // <--- Thêm prop
  loadingRoles?: boolean;         // <--- Thêm prop
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
}

const AVAILABLE_ORGS = [
  { id: 'org-001', label: 'HAN (org-001)' },
  { id: 'org-002', label: 'SGN (org-002)' },
];

export default function UserFormDialog({
  open,
  editUser,
  rolesList,
  loadingRoles = false,
  onClose,
  onSave,
}: UserFormDialogProps) {
  const theme = useTheme();

  const defaultRole = rolesList[0] || 'GUARD';
  const defaultFormState: UserFormData = {
    email: '',
    password: '',
    full_name: '',
    organization_id: 'org-001',
    role_codes: [defaultRole],
    is_active: true,
  };

  const [formData, setFormData] = useState<UserFormData>(defaultFormState);
  const [passwordError, setPasswordError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync dữ liệu Form khi editUser hoặc rolesList thay đổi
  useEffect(() => {
    setPasswordError('');
    if (editUser) {
      setFormData({
        email: editUser.email,
        password: '',
        full_name: editUser.full_name || '',
        organization_id: editUser.organization_id || 'org-001',
        role_codes: editUser.roles?.length ? [editUser.roles[0]] : [rolesList[0] || 'GUARD'],
        is_active: editUser.is_active ?? true,
      });
    } else {
      setFormData({
        ...defaultFormState,
        role_codes: [rolesList[0] || 'GUARD'],
      });
    }
  }, [editUser, open, rolesList]);

  const selectedRole = formData.role_codes[0] || rolesList[0] || 'GUARD';

  const handlePasswordChange = (val: string) => {
    setFormData({ ...formData, password: val });
    if (val && val.length < 8) {
      setPasswordError('Mật khẩu phải có tối thiểu 8 ký tự');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editUser && (!formData.password || formData.password.length < 8)) {
      setPasswordError('Mật khẩu phải có tối thiểu 8 ký tự');
      return;
    }

    if (editUser && formData.password && formData.password.length < 8) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 8 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu tài khoản:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '12px' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
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
                disabled={Boolean(editUser)}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={editUser ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu'}
                size="small"
                type="password"
                required={!editUser}
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={Boolean(passwordError)}
                helperText={passwordError || (editUser ? '' : 'Tối thiểu 8 ký tự')}
                slotProps={{ htmlInput: { minLength: 8 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Mã Tổ chức (Organization ID)"
                size="small"
                value={formData.organization_id}
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
              >
                {AVAILABLE_ORGS.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Select Role dynamic từ props */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Vai trò (Role)"
                size="small"
                value={selectedRole}
                disabled={loadingRoles}
                onChange={(e) => setFormData({ ...formData, role_codes: [e.target.value] })}
                slotProps={{
                  select: {
                    IconComponent: loadingRoles ? () => <CircularProgress size={18} sx={{ mr: 1 }} /> : undefined
                  }
                }}
              >
                {rolesList.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    color="success"
                  />
                }
                label={formData.is_active ? 'Tài khoản: Hoạt động' : 'Tài khoản: Tạm khóa'}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={submitting} sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 'bold' }}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="contained" loading={submitting} sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 'bold', px: 3 }}>
            {editUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}