import { useEffect, useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Grid as Grid, TextField, MenuItem, useTheme 
} from '@mui/material';
import type { UserItem, UserRole } from '../types';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editData: UserItem | null;
}

const defaultState = {
  username: '', fullName: '', email: '', phoneNumber: '', role: 'SECURITY_GUARD' as UserRole, status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
};

export default function UserFormDialog({ open, onClose, onSave, editData }: UserFormDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (editData) {
      setFormData({
        username: editData.username,
        fullName: editData.fullName,
        email: editData.email,
        phoneNumber: editData.phoneNumber,
        role: editData.role,
        status: editData.status
      });
    } else {
      setFormData(defaultState);
    }
  }, [editData, open]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px', p: 0.5 } } }}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.125rem', pb: 1 }}>
        {editData ? 'Cập nhật tài khoản nhân sự' : 'Tạo mới tài khoản nhân sự'}
      </DialogTitle>
      <DialogContent dividers sx={{ borderTop: `1px solid ${theme.palette.customBg?.border || '#e0e0e0'}`, borderBottom: `1px solid ${theme.palette.customBg?.border || '#e0e0e0'}`, py: 3 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Họ và tên" size="small" required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              slotProps={{ input: { sx: { borderRadius: '6px' } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Tên đăng nhập" size="small" required disabled={!!editData}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              slotProps={{ input: { sx: { borderRadius: '6px' } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Địa chỉ Email" size="small" type="email" required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              slotProps={{ input: { sx: { borderRadius: '6px' } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Số điện thoại" size="small" required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              slotProps={{ input: { sx: { borderRadius: '6px' } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth select label="Vai trò phân quyền" size="small"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              slotProps={{ input: { sx: { borderRadius: '6px' } } }}
            >
              <MenuItem value="ADMIN">Quản trị viên</MenuItem>
              <MenuItem value="MANAGER">Điều hành bến</MenuItem>
              <MenuItem value="SECURITY_GUARD">Bảo vệ bốt</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth select label="Trạng thái tài khoản" size="small"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
              disabled={editData?.role === 'ADMIN'}
              slotProps={{ input: { sx: { borderRadius: '6px' } } }}
            >
              <MenuItem value="ACTIVE">Hoạt động</MenuItem>
              <MenuItem value="INACTIVE">Tạm khóa</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600 }}>
          Hủy bỏ
        </Button>
        <Button onClick={handleSubmit} variant="contained" disableElevation sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600, px: 3 }}>
          Xác nhận lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}