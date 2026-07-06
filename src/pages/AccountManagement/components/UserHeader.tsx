import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface UserHeaderProps {
  onAddClick: () => void;
}

export default function UserHeader({ onAddClick }: UserHeaderProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, // Mobile xếp dọc, Desktop xếp ngang
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'flex-start' }, // Mobile nút kéo dài full-width
        gap: 2,
        mb: 3 
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.5px', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Quản lý tài khoản nhân sự
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Cấp phát quyền hạn, cấu hình bốt trực và giám sát trạng thái hoạt động của nhân sự toàn hệ thống.
        </Typography>
      </Box>

      <Button
        variant="contained"
        disableElevation
        startIcon={<AddIcon />}
        onClick={onAddClick}
        sx={{
          borderRadius: '8px',
          fontWeight: 600,
          textTransform: 'none',
          px: 2.5,
          py: { xs: 1.2, sm: 1 }, // Mobile làm nút to hơn một chút để dễ bấm cảm ứng
          fontSize: '0.875rem',
          whiteSpace: 'nowrap'
        }}
      >
        Thêm tài khoản
      </Button>
    </Box>
  );
}