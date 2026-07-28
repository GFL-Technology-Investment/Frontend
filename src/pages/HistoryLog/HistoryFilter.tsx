import { Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

interface HistoryFilterProps {
  filterGate: string;
  filterDate: string;
  searchCar: string;
  filterStatus: string; // Thêm prop quản lý trạng thái xe
  onGateChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void; // Thêm callback đổi trạng thái
}

export default function HistoryFilter({
  filterGate,
  filterDate,
  searchCar,
  filterStatus,
  onGateChange,
  onDateChange,
  onSearchChange,
  onStatusChange,
}: HistoryFilterProps) {
  const theme = useTheme();

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 2,
        bgcolor: theme.palette.customBg.card, 
        border: `1px solid ${theme.palette.customBg.border}`, 
        borderRadius: '4px',
        boxShadow: 'none'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>
          <FilterAltIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} /> Bộ lọc kiểm soát dữ liệu
        </Typography>
      </Box>
      
      <Grid container spacing={1.5}> {/* Thu hẹp khoảng cách giữa các ô nhập liệu */}
        
        {/* 1. Ô TÌM KIẾM NHANH (Nên đưa lên đầu tiên vì bảo vệ dùng nhiều nhất) */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Tìm kiếm nhanh"
            placeholder="Biển số / CCCD / Tên tài xế..."
            value={searchCar}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
          />
        </Grid>

        {/* 2. CHỌN TRẠNG THÁI (Mới bổ sung cho chuẩn nghiệp vụ bãi xe) */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-select-label" sx={{ color: theme.palette.text.secondary }}>Trạng thái xe</InputLabel>
            <Select
              labelId="status-select-label"
              value={filterStatus}
              label="Trạng thái xe"
              onChange={(e) => onStatusChange(e.target.value)}
              sx={{ color: theme.palette.text.primary, borderRadius: '4px' }}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="checked_in">Trong bến</MenuItem>
              <MenuItem value="checked_out">Đã xuất bến</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 3. CHỌN CỔNG / LÀN */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="gate-select-label" sx={{ color: theme.palette.text.secondary }}>Chọn Cổng/Làn</InputLabel>
            <Select
              labelId="gate-select-label"
              value={filterGate}
              label="Chọn Cổng/Làn"
              onChange={(e) => onGateChange(e.target.value)}
              sx={{ color: theme.palette.text.primary, borderRadius: '4px' }}
            >
              <MenuItem value="all">Tất cả các cổng</MenuItem>
              <MenuItem value="gate-001">Cổng vào 01</MenuItem>
              <MenuItem value="gate-002">Cổng vào 02</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 4. CHỌN NGÀY RA VÀO */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Chọn Ngày Ra Vào"
            value={filterDate}
            onChange={(e) => onDateChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
          />
        </Grid>

      </Grid>
    </Paper>
  );
}