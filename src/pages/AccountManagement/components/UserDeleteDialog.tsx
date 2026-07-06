import { Dialog, DialogContent, DialogActions, Box, Typography, Button, alpha, useTheme } from '@mui/material';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

interface UserDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UserDeleteDialog({ open, onClose, onConfirm }: UserDeleteDialogProps) {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px', p: 1 } } }}>
      <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 56, height: 56, 
            bgcolor: alpha(theme.palette.error.main, 0.08),
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', mx: 'auto', mb: 2
          }}
        >
          <WarningRoundedIcon sx={{ fontSize: 28, color: 'error.main' }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1.05rem' }}>
          Xác nhận xóa tài khoản?
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ px: 1, lineHeight: 1.5 }}>
          Hành động này sẽ thu hồi vĩnh viễn quyền đăng nhập của nhân sự khỏi hệ thống terminal. Bạn có chắc chắn muốn thực hiện?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 1.5 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600, minWidth: 90 }}>
          Hủy
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disableElevation sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600, minWidth: 90 }}>
          Xóa bỏ
        </Button>
      </DialogActions>
    </Dialog>
  );
}