//Khối chuyên hiển thị các cảnh báo khẩn cấp hệ thống.
import { Box, Paper, Typography } from "@mui/material";
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

export default function AlertsPanel() {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid #ffcdd2", bgcolor: "#fffbfe", minHeight: 270 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "error.main", display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <ReportProblemIcon fontSize="small" /> Cảnh báo
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography variant="body2" sx={{ color: "#333" }}>• <b>TN11 RFID</b> không đọc được tại Depot</Typography>
        <Typography variant="body2" sx={{ color: "#333" }}>• <b>TN07</b> quá thời gian tra nạp</Typography>
        <Typography variant="body2" sx={{ color: "#333" }}>• <b>Camera Depot</b> mất kết nối</Typography>
      </Box>
    </Paper>
  );
}