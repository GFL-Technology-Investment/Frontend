//Thành phần hiển thị 6 thẻ thông số nhanh ở đầu trang.
import { Paper, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";

interface KpiCardsProps {
  isLoading: boolean;
  totalVehicles: number;
  vehiclesInAirport: number;
  vehiclesCheckedOut: number;
}

export default function KpiCards({ isLoading, totalVehicles, vehiclesInAirport, vehiclesCheckedOut }: KpiCardsProps) {
  const theme = useTheme();

  const kpiData = [
    {
      title: "Tổng số xe",
      value: isLoading ? "..." : totalVehicles,
      color: theme.palette.text.primary,
    },
    {
      title: "Trong sân bay",
      value: isLoading ? "..." : vehiclesInAirport,
      color: "#0288d1",
      bgColor: theme.palette.mode === 'light' ? '#e3f2fd' : 'rgba(2, 136, 209, 0.08)'
    },
    { title: "Đang tra nạp", value: 0, color: "#2e7d32", bgColor: "#e8f5e9" },
    { title: "Chờ nhiệm vụ", value: 0, color: "#b78103", bgColor: "#fff8e1" },
    {
      title: "Đã ra cổng",
      value: isLoading ? "..." : vehiclesCheckedOut,
      color: theme.palette.mode === 'light' ? '#424242' : '#bdbdbd'
    },
    { title: "Cảnh báo", value: 0, color: "#c62828", bgColor: "#ffebee" },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {kpiData.map((kpi, idx) => (
        <Grid size={{ xs: 6, sm: 4, md: 2 }} key={idx}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: kpi.bgColor || "background.paper",
              border: `1px solid ${theme.palette.divider}`,
              textAlign: "left",
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              {kpi.title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: "bold", color: kpi.color, mt: 1 }}>
              {kpi.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}