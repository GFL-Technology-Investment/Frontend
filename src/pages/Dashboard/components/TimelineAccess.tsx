//Khối hiển thị nhật ký / dòng sự kiện di chuyển thời gian thực của các xe.
import { Box, Paper, Typography } from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';

interface TimelineItem {
  time: string;
  text: string;
  isError: boolean;
}

interface TimelineAccessProps {
  isLoading: boolean;
  timelineRecords: TimelineItem[];
}

export default function TimelineAccess({ isLoading, timelineRecords }: TimelineAccessProps) {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, maxHeight: 270, overflowY: "auto" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <HistoryIcon fontSize="small" /> Timeline ra vào
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {isLoading ? (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Đang kết nối luồng sự kiện...</Typography>
        ) : timelineRecords.length === 0 ? (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Không có lịch sử quét thẻ gần đây</Typography>
        ) : (
          timelineRecords.map((row, idx) => (
            <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Typography variant="caption" sx={{ color: row.isError ? "error.main" : "text.secondary", fontWeight: "bold", minWidth: 40 }}>
                {row.time}
              </Typography>
              <Typography variant="body2" sx={{ color: row.isError ? "error.main" : "text.primary", fontWeight: row.isError ? "bold" : "normal" }}>
                {row.text}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}