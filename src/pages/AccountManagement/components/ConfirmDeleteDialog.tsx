import {
  Dialog, DialogContent, DialogActions, Box, Typography, Button, useTheme, alpha
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ConfirmDeleteDialogProps {
  open: boolean;
  targetId: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({ open, targetId, onClose, onConfirm }: ConfirmDeleteDialogProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', p: 1 } } }}
    >
      <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}
        >
          <DeleteIcon sx={{ fontSize: 32, color: 'error.main' }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Xác nhận xóa tài khoản?
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Bạn có chắc muốn xóa tài khoản ID: <b>{targetId}</b> ra khỏi hệ thống? Hành động này không thể hoàn tác.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
        >
          Xóa ngay
        </Button>
      </DialogActions>
    </Dialog>
  );
}