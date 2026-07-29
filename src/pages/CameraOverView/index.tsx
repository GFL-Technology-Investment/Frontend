import { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  useTheme, 
  CardActionArea, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Tabs,
  Tab,
  Skeleton
} from '@mui/material';
import Grid from '@mui/material/Grid'; 
import { useNavigate } from 'react-router-dom';
import VideocamIcon from '@mui/icons-material/Videocam';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

// Định nghĩa Interface dữ liệu cấu trúc
interface CameraItem {
  id: string;
  name: string;
  airport: 'HAN' | 'SGN' | 'DAD' | 'CXR' | 'HPH' | 'PQC';
  type: 'IN' | 'OUT'; 
  streamUrl: string;
}

// 📌 TÁCH BIỆT MOCK DATA: Giúp code gọn gàng, sẵn sàng cho việc fetch API sau này
const CAMERA_LIST: CameraItem[] = [
  { id: 'han-in-1', name: 'HAN - Cổng Vào Làn 01', airport: 'HAN', type: 'IN', streamUrl: 'https://phuongdung.com/upload/baiviet/lapdatcameragiamsatchobaigiuxe-1490.jpg' },
  { id: 'han-in-2', name: 'HAN - Cổng Vào Làn 02', airport: 'HAN', type: 'IN', streamUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP8b5J8PpdhIMUy9l8Ps53i1xqOBwAI--Nufm8cA7OZsSVB_LTvJ_KR8Q&s=10' },
  { id: 'han-in-3', name: 'HAN - Cổng Vào Làn 03', airport: 'HAN', type: 'IN', streamUrl: 'https://tl.cdnchinhphu.vn/344445545208135680/2022/6/27/img-5828-16563035923211045998597.jpg' },
  { id: 'han-out-1', name: 'HAN - Cổng Ra Làn 01', airport: 'HAN', type: 'OUT', streamUrl: 'https://maisonoffice.vn/wp-content/uploads/2024/09/0-bai-do-xe-o-to-ha-noi.jpg' },
  { id: 'han-out-2', name: 'HAN - Cổng Ra Làn 02', airport: 'HAN', type: 'OUT', streamUrl: 'https://maisonoffice.vn/wp-content/uploads/2024/08/bai-do-xe-hoi.jpg' },
  { id: 'han-out-3', name: 'HAN - Cổng Ra Làn 03', airport: 'HAN', type: 'OUT', streamUrl: 'https://tl.cdnchinhphu.vn/344445545208135680/2022/6/27/img-5828-16563035923211045998597.jpg' },
  { id: 'sgn-in-1', name: 'SGN - Cổng Vào Làn 01', airport: 'SGN', type: 'IN', streamUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs0nI1RamuYacFj8e48E7MfOpXSHL7WJc94K0xfExDpCB8ZMWUXXI8FKg&s=10' },
  { id: 'sgn-out-1', name: 'SGN - Cổng Ra Làn 01', airport: 'SGN', type: 'OUT', streamUrl: 'https://media-cdn-v2.laodong.vn/storage/newsportal/2024/5/31/1347043/Horizon-Tower-3.jpg' },
  { id: 'dad-in-1', name: 'DAD - Cổng Vào Làn 01', airport: 'DAD', type: 'IN', streamUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP8b5J8PpdhIMUy9l8Ps53i1xqOBwAI--Nufm8cA7OZsSVB_LTvJ_KR8Q&s=10' },
  { id: 'cxr-out-1', name: 'CXR - Cổng Ra Giám Sát', airport: 'CXR', type: 'OUT', streamUrl: 'https://maisonoffice.vn/wp-content/uploads/2024/09/0-bai-do-xe-o-to-ha-noi.jpg' },
  { id: 'hph-in-1', name: 'HPH - Cổng Vào Xe Khách', airport: 'HPH', type: 'IN', streamUrl: 'https://tl.cdnchinhphu.vn/344445545208135680/2022/6/27/img-5828-16563035923211045998597.jpg' },
  { id: 'pqc-in-1', name: 'PQC - Cổng Vào An Ninh', airport: 'PQC', type: 'IN', streamUrl: 'https://phuongdung.com/upload/baiviet/lapdatcameragiamsatchobaigiuxe-1490.jpg' },
];

export default function CameraOverviewPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [selectedAirport, setSelectedAirport] = useState<string>('HAN');
  const [gateType, setGateType] = useState<'IN' | 'OUT'>('IN');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Giả lập hiệu ứng tải luồng Stream mượt mà khi đổi Bộ lọc (Filter)
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [selectedAirport, gateType]);

  const handleSelectCamera = (cam: CameraItem) => {
    if (cam.type === 'IN') {
      navigate('/vehicle-in', { state: { gateId: cam.id, airport: selectedAirport } });
    } else {
      navigate('/vehicle-out', { state: { gateId: cam.id, airport: selectedAirport } });
    }
  };

  const filteredCameras = useMemo(() => {
    return CAMERA_LIST.filter(cam => cam.airport === selectedAirport && cam.type === gateType);
  }, [selectedAirport, gateType]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>

      {/* KHU VỰC TIÊU ĐỀ & THANH SELECT CHỌN SÂN BAY */}
      <Box
        sx={{
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' }
            }}
          >
            <VideocamIcon fontSize="large" /> TRUNG TÂM GIÁM SÁT STREAM CAMERA REAL-TIME
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
            Chọn luồng camera thích hợp để quản lý vận hành Checkin (Cổng Vào) hoặc Checkout (Cổng Ra) của phương tiện.
          </Typography>
        </Box>

        <FormControl
          size="small"
          sx={{
            width: { xs: '100%', md: 'auto' },
            minWidth: { xs: '100%', md: 260 },
          }}
        >
          <InputLabel
            id="airport-select-label"
            sx={{
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: theme.palette.background.default, 
              paddingRight: '6px',
            }}
          >
            <FlightTakeoffIcon fontSize="small" /> Chọn Sân Bay
          </InputLabel>
          <Select
            labelId="airport-select-label"
            value={selectedAirport}
            label="Chọn Sân Bay"
            onChange={(e) => setSelectedAirport(e.target.value)}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              fontWeight: 'bold',
              '& .MuiSelect-select': { display: 'flex', alignItems: 'center' }
            }}
          >
            <MenuItem value="HAN">Nội Bài (HAN)</MenuItem>
            <MenuItem value="SGN">Tân Sơn Nhất (SGN)</MenuItem>
            <MenuItem value="DAD">Đà Nẵng (DAD)</MenuItem>
            <MenuItem value="CXR">Cam Ranh (CXR)</MenuItem>
            <MenuItem value="HPH">Cát Bi (HPH)</MenuItem>
            <MenuItem value="PQC">Phú Quốc (PQC)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* THANH TABS PHÂN LOẠI CHỨC NĂNG CỔNG VÀO / CỔNG RA */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={gateType} 
          onChange={(_, newValue) => setGateType(newValue)} 
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab 
            icon={<LoginIcon fontSize="small" />} 
            iconPosition="start" 
            label="QUẢN LÝ CỔNG VÀO (CHECKIN)" 
            value="IN" 
            sx={{ fontWeight: 'bold', fontSize: '13px', minHeight: '48px' }}
          />
          <Tab 
            icon={<LogoutIcon fontSize="small" />} 
            iconPosition="start" 
            label="QUẢN LÝ CỔNG RA (CHECKOUT)" 
            value="OUT" 
            sx={{ fontWeight: 'bold', fontSize: '13px', minHeight: '48px' }}
          />
        </Tabs>
      </Box>

      {/* LƯỚI HIỂN THỊ CAMERA - TÍCH HỢP HIỆU ỨNG SKELETON LOADING */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={n}>
              <Card sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, boxShadow: 'none' }}>
                <Skeleton variant="rectangular" width="100%" height={220} animation="wave" />
                <CardContent sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="20%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredCameras.length === 0 ? (
        <Paper 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            bgcolor: theme.palette.background.paper, 
            border: `1px solid ${theme.palette.divider}`, 
            borderRadius: 2,
            boxShadow: 'none'
          }}
        >
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Hiện tại chưa cấu hình hệ thống Camera {gateType === 'IN' ? 'CỔNG VÀO' : 'CỔNG RA'} nào tại khu vực này.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCameras.map((cam) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cam.id}>
              <Card
                sx={{
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4] 
                  }
                }}
              >
                <CardActionArea onClick={() => handleSelectCamera(cam)}>
                  
                  {/* Luồng hình ảnh Live Camera */}
                  <Box
                    component="img"
                    src={cam.streamUrl}
                    alt={cam.name}
                    sx={{
                      width: '100%',
                      height: '220px',
                      objectFit: 'cover',
                      backgroundColor: theme.palette.common.black,
                      display: 'block'
                    }}
                  />

                  {/* Thanh thông tin chân Card - Sửa lỗi triệt tiêu padding đè */}
                  <CardContent 
                    sx={{ 
                      p: 1.5, 
                      '&:last-child': { pb: 1.5 }, // 🌟 TRIỆT TIÊU PADDING 24PX MẶC ĐỊNH CỦA MUI
                      bgcolor: theme.palette.action.hover, 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: '600', color: theme.palette.text.primary }}>
                      {cam.name}
                    </Typography>

                    {/* Trạng thái LIVE nhấp nháy */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 8, height: 8, borderRadius: '50%',
                          bgcolor: theme.palette.success.main, 
                          animation: 'pulse 1.5s infinite alternate',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.4 },
                            '100%': { opacity: 1 }
                          }
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: theme.palette.success.main, 
                          fontWeight: 'bold', 
                          fontSize: '11px',
                          letterSpacing: '0.5px'
                        }}
                      >
                        LIVE
                      </Typography>
                    </Box>
                  </CardContent>

                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}