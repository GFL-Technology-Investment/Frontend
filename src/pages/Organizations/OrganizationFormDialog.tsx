import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, FormControlLabel, Switch, useTheme
} from '@mui/material';
import type { OrganizationItem } from './Organization';

interface OrganizationFormDialogProps {
  open: boolean;
  editOrg: OrganizationItem | null;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

export default function OrganizationFormDialog({
  open, editOrg, onClose, onSave
}: OrganizationFormDialogProps) {
  const theme = useTheme();
  
  const [orgId, setOrgId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editOrg) {
      setOrgId(editOrg.organization_id);
      setName(editOrg.name || '');
      setIsActive(Boolean(editOrg.is_active));
    } else {
      setOrgId('');
      setName('');
      setIsActive(true);
    }
  }, [editOrg, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editOrg) {
        // Schema PUT khi chỉnh sửa: có đầy đủ organization_id, name, is_active
        await onSave({
          organization_id: orgId.trim(),
          name: name.trim(),
          is_active: isActive,
        });
      } else {
        // Schema POST khi thêm mới
        await onSave({
          organization_id: orgId.trim(),
          name: name.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu tổ chức:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
      <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
        {editOrg ? 'CẬP NHẬT TỔ CHỨC' : 'TẠO MỚI TỔ CHỨC'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            {/* Organization ID */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mã Tổ chức (organization_id)"
                placeholder="VD: org-003"
                size="small"
                required
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
              />
            </Grid>

            {/* Tên Tổ chức */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Tên Tổ chức"
                placeholder="VD: Sân Nội Bài / Org test"
                size="small"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>

            {/* Trạng thái - Chỉ hiển thị khi Chỉnh sửa */}
            {Boolean(editOrg) && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      color="success"
                    />
                  }
                  label={isActive ? 'Trạng thái: Kích hoạt (Active)' : 'Trạng thái: Tạm khóa (Inactive)'}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={submitting} sx={{ borderRadius: '6px' }}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="contained" loading={submitting} sx={{ borderRadius: '6px', px: 3 }}>
            {editOrg ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}