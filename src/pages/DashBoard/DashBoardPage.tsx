import { Box, Paper, Typography, useTheme, Card, CardContent, LinearProgress } from "@mui/material";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import axiosInstance from "../../configs/axios";

const fleetStatus = [
  { id: "TN01", status: "Tra nạp", fuel: 62, position: "Stand 12", color: "success" },
  { id: "TN02", status: "Đang vào", fuel: 95, position: "Gate A", color: "primary" },
  { id: "TN03", status: "Chờ", fuel: 80, position: "Depot", color: "warning" },
  { id: "TN05", status: "Tra nạp", fuel: 62, position: "Stand 6", color: "success" },
  { id: "TN08", status: "Đang ra", fuel: 40, position: "Gate B", color: "info" },
  { id: "TN11", status: "RFID lỗi", fuel: null, position: "Depot", color: "error" },
];

const timelineData = [
  { time: "10:15", text: "TN05 đã vào cổng A" },
  { time: "10:18", text: "TN03 bắt đầu tra nạp" },
  { time: "10:26", text: "TN08 ra cổng B" },
  { time: "10:35", text: "TN11 RFID không đọc được tại Depot", isError: true },
];

const chartData = [
  { name: "8h", value: 30 },
  { name: "9h", value: 55 },
  { name: "10h", value: 40 },
  { name: "11h", value: 0 },
];

export default function DashboardPage() {
  const theme = useTheme();

  // --- QUAN LÝ TRẠNG THÁI REAL-TIME ---
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [vehiclesInAirport, setVehiclesInAirport] = useState<number>(0);
  const [vehiclesCheckedOut, setVehiclesCheckedOut] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Gọi API lấy danh sách lịch sử lịch trình
        const response = await axiosInstance.get("/api/v1/access/history", {
          params: { page: 1, limit: 50 }
        });

        const allLogs = response.data?.data || [];

        if (Array.isArray(allLogs)) {
          // 1. Bước lọc: Chỉ lấy các bản ghi của XE (vehicle_event_uid khác null)
          const vehicleLogs = allLogs.filter((log: any) => log.vehicle_event_uid !== null && log.vehicle_event_uid !== undefined);

          // 2. Phân loại và đếm trạng thái luồng xe dựa trên 'status'
          let countInAirport = 0;
          let countCheckedOut = 0;

          vehicleLogs.forEach((log: any) => {
            if (log.status === "CHECKED_IN") {
              countInAirport++;
            } else if (log.status === "CHECKED_OUT") {
              countCheckedOut++;
            }
          });

          // 3. Cập nhật đồng bộ lên giao diện điều hành
          setTotalVehicles(vehicleLogs.length);
          setVehiclesInAirport(countInAirport);
          setVehiclesCheckedOut(countCheckedOut);
        }
      } catch (error) {
        console.error("Lỗi khi đồng bộ dữ liệu giám sát luồng xe:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Thiết lập mảng KPI đồng bộ dữ liệu động
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
    { title: "Đang tra nạp", value: 7, color: "#2e7d32", bgColor: "#e8f5e9" },
    { title: "Chờ nhiệm vụ", value: 5, color: "#b78103", bgColor: "#fff8e1" },
    { 
      title: "Đã ra cổng", 
      value: isLoading ? "..." : vehiclesCheckedOut, 
      color: theme.palette.mode === 'light' ? '#424242' : '#bdbdbd' 
    },
    { title: "Cảnh báo", value: 1, color: "#c62828", bgColor: "#ffebee" },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>

      {/* 1. KHU VỰC THẺ THÔNG SỐ (KPI TOP CARDS) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiData.map((kpi, idx) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: kpi.bgColor || theme.palette.customBg?.card || "background.paper",
                border: `1px solid ${theme.palette.customBg?.border || theme.palette.divider}`,
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

      {/* 2. KHU VỰC CAMERA RA VÀO CỔNG & FLEET STATUS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        
        {/* CAMERA MONITORING PANELS */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
                <CameraAltIcon fontSize="small" /> Camera ra vào cổng
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Cập nhật liên tục</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <Box sx={{ height: 120, bgcolor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CameraAltIcon color="disabled" fontSize="large" />
                  </Box>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Camera Gate A 🟢</Typography>
                    <Typography variant="caption" component="div" sx={{ mt: 1 }}><b>Biển số:</b> 29C-123.45</Typography>
                    <Typography variant="caption" component="div"><b>RFID:</b> Hợp lệ</Typography>
                    <Typography variant="caption" component="div"><b>Tài xế:</b> Nguyễn Văn A</Typography>
                    <Typography variant="caption" component="div"><b>Thời gian:</b> 10:18</Typography>
                    <Typography variant="caption" component="div" sx={{ color: "success.main", fontWeight: "bold" }}> Độ tin cậy: 98.6%</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <Box sx={{ height: 120, bgcolor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CameraAltIcon color="disabled" fontSize="large" />
                  </Box>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Camera Gate B 🟢</Typography>
                    <Typography variant="caption" component="div" sx={{ mt: 1 }}><b>Biển số:</b> 30H-678.90</Typography>
                    <Typography variant="caption" component="div"><b>RFID:</b> Hợp lệ</Typography>
                    <Typography variant="caption" component="div"><b>Tài xế:</b> Trần Văn B</Typography>
                    <Typography variant="caption" component="div"><b>Thời gian:</b> 10:26</Typography>
                    <Typography variant="caption" component="div" sx={{ color: "success.main", fontWeight: "bold" }}> Độ tin cậy: 97.2%</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "error.light", bgcolor: "#fdf2f2" }}>
                  <Box sx={{ height: 120, bgcolor: "#fbeaea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ErrorOutlineIcon color="error" fontSize="large" />
                  </Box>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "error.main" }}>Camera Depot 🔴</Typography>
                    <Typography variant="caption" component="div" sx={{ mt: 1 }}><b>Biển số:</b> —</Typography>
                    <Typography variant="caption" component="div" sx={{ color: "error.main", fontWeight: "bold" }}>RFID Không đọc được</Typography>
                    <Typography variant="caption" component="div"><b>Tài xế:</b> —</Typography>
                    <Typography variant="caption" component="div"><b>Thời gian:</b> 10:35</Typography>
                    <Typography variant="caption" component="div"><b>Độ tin cậy:</b> —</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* FLEET STATUS PANELS */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
              🚛 Fleet status
            </Typography>

            <Grid container sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1, px: 1 }}>
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
        </Grid>
      </Grid>

      {/* 3. KHU VỰC THỜI GIAN, THỐNG KÊ NHANH & CẢNH BÁO */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, minHeight: 250 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>🕒 Timeline ra vào</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {timelineData.map((row, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Typography variant="caption" sx={{ color: row.isError ? "error.main" : "text.secondary", fontWeight: "bold", minWidth: 40 }}>
                    {row.time}
                  </Typography>
                  <Typography variant="body2" sx={{ color: row.isError ? "error.main" : "text.primary", fontWeight: row.isError ? "bold" : "normal" }}>
                    {row.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, minHeight: 250 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>📊 Thống kê nhanh</Typography>
            <Box sx={{ height: 100, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" fill="#2196f3" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.8 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>RFID đọc thành công</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>98.8%</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Lượt vào / ra</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>152 / 151</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Tổng nhiên liệu đã cấp</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>52.000 L</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid #ffcdd2", bgcolor: "#fffbfe", minHeight: 250 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "error.main", display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              ⚠ Cảnh báo
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#333" }}>• <b>TN11 RFID</b> không đọc được tại Depot</Typography>
              <Typography variant="body2" sx={{ color: "#333" }}>• <b>TN07</b> quá thời gian tra nạp</Typography>
              <Typography variant="body2" sx={{ color: "#333" }}>• <b>Camera Depot</b> mất kết nối</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}