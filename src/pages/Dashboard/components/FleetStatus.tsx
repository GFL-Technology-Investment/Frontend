//Khối quản lý danh sách đội xe tra nạp nhiên liệu và tiến độ của từng xe.
import { Box, Paper, Typography, LinearProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const fleetStatus = [
  { id: "TN01", status: "Tra nạp", fuel: 62, position: "Stand 12", color: "success" },
  { id: "TN02", status: "Đang vào", fuel: 95, position: "Gate A", color: "primary" },
  { id: "TN03", status: "Chờ", fuel: 80, position: "Depot", color: "warning" },
  { id: "TN05", status: "Tra nạp", fuel: 62, position: "Stand 6", color: "success" },
  { id: "TN08", status: "Đang ra", fuel: 40, position: "Gate B", color: "info" },
  { id: "TN11", status: "RFID lỗi", fuel: null, position: "Depot", color: "error" },
];

export default function FleetStatus() {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <LocalShippingIcon fontSize="small" /> Fleet status
      </Typography>

      <Grid container sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, pb: 1, mb: 1, px: 1 }}>
        <Grid size={2}><Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>Xe</Typography></Grid>
        <Grid size={4}><Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>Trạng thái</Typography></Grid>
        <Grid size={3}><Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>NL</Typography></Grid>
        <Grid size={3}><Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>Vị trí</Typography></Grid>
      </Grid>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {fleetStatus.map((item, idx) => (
          <Grid container key={idx} sx={{ alignItems: "center", px: 1 }}>
            <Grid size={2}><Typography variant="body2" sx={{ fontWeight: "bold" }}>{item.id}</Typography></Grid>
            <Grid size={4}>
              <Typography variant="caption" sx={{
                px: 1, py: 0.3, borderRadius: 1, fontWeight: "bold",
                bgcolor: `${item.color}.light`, color: `${item.color}.dark`,
                display: "inline-block"
              }}>
                {item.status}
              </Typography>
            </Grid>
            <Grid size={3} sx={{ pr: 2 }}>
              {item.fuel !== null ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LinearProgress variant="determinate" value={item.fuel} color={item.fuel < 50 ? "warning" : "primary"} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                  <Typography variant="caption">{item.fuel}%</Typography>
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
              )}
            </Grid>
            <Grid size={3}><Typography variant="caption">{item.position}</Typography></Grid>
          </Grid>
        ))}
      </Box>
    </Paper>
  );
}