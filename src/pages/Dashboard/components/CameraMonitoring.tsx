//Khối hiển thị danh sách Camera chụp luồng sự kiện thời gian thực.
import { Box, Paper, Typography, Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CircleIcon from "@mui/icons-material/Circle";

export default function CameraMonitoring() {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
          <CameraAltIcon fontSize="small" /> Camera ra vào cổng
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>Cập nhật liên tục</Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Camera Gate A */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ height: 120, bgcolor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CameraAltIcon color="disabled" fontSize="large" />
            </Box>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Camera Gate A</Typography>
                <CircleIcon sx={{ fontSize: 10, color: "success.main" }} />
              </Box>
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}><b>Biển số:</b> 29C-123.45</Typography>
              <Typography variant="caption" component="div"><b>RFID:</b> Hợp lệ</Typography>
              <Typography variant="caption" component="div"><b>Tài xế:</b> Nguyễn Văn A</Typography>
              <Typography variant="caption" component="div"><b>Thời gian:</b> 10:18</Typography>
              <Typography variant="caption" component="div" sx={{ color: "success.main", fontWeight: "bold" }}> Độ tin cậy: 98.6%</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Camera Gate B */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ height: 120, bgcolor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CameraAltIcon color="disabled" fontSize="large" />
            </Box>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Camera Gate B</Typography>
                <CircleIcon sx={{ fontSize: 10, color: "success.main" }} />
              </Box>
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}><b>Biển số:</b> 30H-678.90</Typography>
              <Typography variant="caption" component="div"><b>RFID:</b> Hợp lệ</Typography>
              <Typography variant="caption" component="div"><b>Tài xế:</b> Trần Văn B</Typography>
              <Typography variant="caption" component="div"><b>Thời gian:</b> 10:26</Typography>
              <Typography variant="caption" component="div" sx={{ color: "success.main", fontWeight: "bold" }}> Độ tin cậy: 97.2%</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Camera Depot Lỗi */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "error.light", bgcolor: "#fdf2f2" }}>
            <Box sx={{ height: 120, bgcolor: "#fbeaea", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ErrorOutlineIcon color="error" fontSize="large" />
            </Box>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "error.main" }}>Camera Depot</Typography>
                <CircleIcon sx={{ fontSize: 10, color: "error.main" }} />
              </Box>
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}><b>Biển số:</b> —</Typography>
              <Typography variant="caption" component="div" sx={{ color: "error.main", fontWeight: "bold" }}>RFID Không đọc được</Typography>
              <Typography variant="caption" component="div"><b>Tài xế:</b> —</Typography>
              <Typography variant="caption" component="div"><b>Thời gian:</b> 10:35</Typography>
              <Typography variant="caption" component="div"><b>Độ tin cậy:</b> —</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}