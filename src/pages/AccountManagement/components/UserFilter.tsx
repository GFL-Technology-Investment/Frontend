import { Box, TextField, InputAdornment, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface UserFilterProps {
  value: string;
  onChange: (val: string) => void;
}

export default function UserFilter({ value, onChange }: UserFilterProps) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 2.5, display: 'flex', gap: 2 }}>
      <TextField
        size="small"
        placeholder="Tìm kiếm theo mã NV, họ tên hoặc username..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          width: { xs: '100%', sm: 360 }, // Mobile chiếm 100% chiều ngang, Desktop fix 360px
          bgcolor: theme.palette.customBg?.card || 'background.paper',
          '& .MuiOutlinedInput-root': { 
            borderRadius: '8px',
            fontSize: '0.875rem'
          }
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