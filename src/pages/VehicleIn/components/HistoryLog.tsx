// components/HistoryLog.tsx
import { Paper, Typography, List, ListItem, ListItemText, useTheme } from '@mui/material';

interface HistoryLogProps {
  history: string[];
}

export default function HistoryLog({ history }: HistoryLogProps) {
  const theme = useTheme();

  // Hàm tiện ích phân tích màu sắc động dựa trên nội dung text log
  const getLogColors = (logText: string) => {
    const isErrorOrBlock = logText.includes('CHƯA CHECKOUT') || logText.includes('LỖI') || logText.includes('THẤT BẠI');
    
    if (isErrorOrBlock) {
      return {
        primary: theme.palette.mode === 'light' ? '#d32f2f' : '#f44336', // Đỏ Enterprise
        secondary: theme.palette.mode === 'light' ? '#ef5350' : '#e57373',
        statusText: '➔ Hệ thống từ chối đăng ký lượt mới!'
      };
    }
    
    // Mặc định là log thành công (In thẻ vào)
    return {
      primary: theme.palette.mode === 'light' ? '#2e7d32' : '#4caf50', // Xanh lá
      secondary: theme.palette.mode === 'light' ? '#4caf50' : '#81c784',
      statusText: '➔ Đã lưu vào cơ sở dữ liệu và in cấp phát thẻ thành công!'
    };
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        bgcolor: theme.palette.customBg?.card || 'background.paper', 
        borderRadius: 2, 
        border: `1px solid ${theme.palette.customBg?.border || theme.palette.divider}` 
      }}
    >
      <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, fontWeight: 'bold', mb: 1 }}>
        📜 Lịch sử liên kết hệ thống (Phiên làm việc hiện tại):
      </Typography>

      {history.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.text.disabled, py: 1 }}>
          Chưa có lượt xe nào được tạo hoặc ghi nhận trong phiên làm việc này.
        </Typography>
      ) : (
        <List sx={{ p: 0 }}>
          {history.map((item, index) => {
            const config = getLogColors(item); // Lấy bảng màu động theo nội dung log

            return (
              <ListItem 
                key={index} 
                disableGutters 
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.customBg?.border || theme.palette.divider}`, 
                  py: 1,
                  '&:last-child': { borderBottom: 'none' } // Đẹp hơn khi log cuối không bị vạch kẻ cắt ngang
                }}
              >
                <ListItemText 
                  primary={item} 
                  secondary={config.statusText}
                  slotProps={{
                    primary: { 
                      sx: { 
                        color: config.primary, 
                        fontWeight: 'bold', 
                        fontSize: '14px' 
                      } 
                    },
                    secondary: { 
                      sx: { 
                        color: config.secondary, 
                        fontSize: '12px',
                        mt: 0.5 
                      } 
                    }
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Paper>
  );
}