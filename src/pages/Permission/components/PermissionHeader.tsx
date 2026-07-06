import { Box, Typography, TextField, InputAdornment, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface PermissionHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function PermissionHeader({ searchTerm, onSearchChange }: PermissionHeaderProps) {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', md: 'center' }, 
        gap: 2,
        mb: 2.5 
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.5px', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Phân quyền an ninh bốt trực
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Thiết lập quyền truy cập camera hạ tầng, phê duyệt cổng Barrier và phân phối danh mục báo cáo dữ liệu.
        </Typography>
      </Box>

      <TextField
        size="small"
        placeholder="Tìm tên hoặc mã nhân viên..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          width: { xs: '100%', md: 320 },
          bgcolor: theme.palette.customBg?.card || 'background.paper',
          '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.875rem' }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}