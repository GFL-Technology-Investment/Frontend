//Thành phần biểu đồ Recharts phân bổ tần suất xe kết hợp thông số RFID động.
import { Box, Paper, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import BarChartIcon from '@mui/icons-material/BarChart';

interface QuickStatsProps {
  isLoading: boolean;
  dynamicChartData: any[];
  rfidSuccessRate: string;
  totalCheckedIn: number;
  totalCheckedOut: number;
}

export default function QuickStats({ isLoading, dynamicChartData, rfidSuccessRate, totalCheckedIn, totalCheckedOut }: QuickStatsProps) {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, minHeight: 250 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <BarChartIcon fontSize="small" /> Thống kê nhanh
      </Typography>
      <Box sx={{ height: 100, mt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dynamicChartData.length > 0 ? dynamicChartData : []}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Bar dataKey="value" fill="#2196f3" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.8 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>RFID/Camera đọc thành công</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{isLoading ? "..." : rfidSuccessRate}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Lượt vào / ra (Hiện tại)</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {isLoading ? "..." : `${totalCheckedIn} / ${totalCheckedOut}`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Tổng nhiên liệu đã cấp</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>52.000 L</Typography>
        </Box>
      </Box>
    </Paper>
  );
}