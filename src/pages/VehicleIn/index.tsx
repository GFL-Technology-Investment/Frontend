import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  IconButton,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useNavigate } from "react-router-dom";

import type { XitecLog } from "../../types/vehicle";
import CccdInfo from "./components/CccdInfo";
import CameraInfo from "./components/CameraInfo";
import HistoryLog from "./components/HistoryLog";
import FaceCompareModal from "../../components/FaceCompareModal";
import CustomButton from "../../components/CustomButton";
import axiosInstance from "../../configs/axios";
import ToastNotification, { type ToastState } from "../../components/ToastNotification";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function VehicleInPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vehicleData, setVehicleData] = useState<XitecLog | null>(null);
  const [eventUid, setEventUid] = useState<string>("");
  const [printHistory, setPrintHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionStatus, setSessionStatus] = useState<string>("");
  const [isOpenCompareModal, setIsOpenCompareModal] = useState<boolean>(false);

  // State quản lý thông báo dùng chung
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showToast = (message: string, severity: ToastState['severity'] = 'success') => {
    setToast({ open: true, message, severity });
  };

  // Khử rò rỉ bộ nhớ RAM (Garbage Collection cho Blob URL)
  useEffect(() => {
    return () => {
      if (vehicleData?.nationalIdImage && vehicleData.nationalIdImage.startsWith("blob:")) {
        URL.revokeObjectURL(vehicleData.nationalIdImage);
      }
    };
  }, [vehicleData?.nationalIdImage]);

  const handleUpdateVehicleField = (field: keyof XitecLog, value: string) => {
    if (vehicleData) setVehicleData({ ...vehicleData, [field]: value });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dọn dẹp URL cũ trước khi gán URL mới
    if (vehicleData?.nationalIdImage && vehicleData.nationalIdImage.startsWith("blob:")) {
      URL.revokeObjectURL(vehicleData.nationalIdImage);
    }

    const imageUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/ocr/cccd", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(">>> [API OCR RESPONSE]:", response.data);

      // Trường hợp 1: Định danh thành công lượt vào mới
      if (response.data?.status === "SUCCESS") {
        const ocrData = response.data.data;
        const linkedSession = response.data.linked_session;
        const currentEventUid = linkedSession?.event_uid || response.data.event_uid || "";

        setEventUid(currentEventUid);
        setSessionStatus(linkedSession?.status || "ONLY_PERSON_REGISTERED");

        setVehicleData({
          id: ocrData?.id || "Không rõ",
          name: ocrData?.name || "Không rõ",
          birth: ocrData?.birth || "",
          place: ocrData?.place || "",
          nationalId: ocrData?.id || "",
          driverName: ocrData?.name || "Không rõ",
          nationalIdImage: imageUrl,
          licensePlate: linkedSession?.expected_plate_number || "CHƯA GẮN XE",
          licensePlateImage: `${API_BASE_URL}/static/media/live_plate.jpg`,
          driverFaceImage: ocrData?.cccd_face_image_url || "data:image/png;base64,...",
          entryTime: linkedSession?.created_at
            ? new Date(linkedSession.created_at).toLocaleString("vi-VN")
            : new Date().toLocaleString("vi-VN"),
        });
        
        showToast("Định danh tài xế và phân tích dữ liệu OCR thành công!", "success");
        
        if (currentEventUid) {
          setIsOpenCompareModal(true);
        }

      // Trường hợp 2: Tài xế trùng lặp / Chưa checkout khỏi hệ thống
      } else if (response.data?.status === "DUPLICATE_CCCD_IMAGE") {
        showToast(response.data?.message || "Tài xế này hiện đang ở trong bến (Chưa checkout)!", "error");
        
        // Giải phóng bộ nhớ ảnh tạm và reset form sạch sẽ
        URL.revokeObjectURL(imageUrl);
        setVehicleData(null);
        setEventUid("");
        setSessionStatus("");
        
      } else {
        // Dự phòng các trạng thái phản hồi khác từ hệ thống
        showToast(response.data?.message || "Phản hồi không rõ từ máy chủ.", "warning");
      }
    } catch (error: any) {
      console.error(">>> [API ERROR OCR VEHICLE-IN]:", error);
      const serverErrorMsg = error.response?.data?.message || error.response?.data?.error;
      
      if (serverErrorMsg) {
        showToast(serverErrorMsg, "error");
      } else {
        showToast("Thất bại khi kết nối máy chủ xử lý dữ liệu OCR.", "error");
      }

      // Reset màn hình về trạng thái trống khi lỗi kết nối mạng
      setVehicleData(null);
      setEventUid("");
      setSessionStatus("");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsLoading(false);
    }
  };

  const handlePrintCard = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!vehicleData) return;

    const printHtml = `
      <html>
        <head>
          <title>PHIẾU XE VÀO CẢNG</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            .ticket { border: 2px dashed #000; padding: 20px; max-width: 400px; margin: 0 auto; }
            h2 { margin-top: 0; color: #111; }
            .info { text-align: left; margin-top: 15px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h2>PHIẾU VÀO CỔNG KIỂM SOÁT</h2>
            <div class="info">
              <p><b>Biển số xe:</b> ${vehicleData.licensePlate}</p>
              <p><b>Tài xế:</b> ${vehicleData.driverName}</p>
              <p><b>Số CCCD:</b> ${vehicleData.nationalId}</p>
              <p><b>Thời gian vào:</b> ${vehicleData.entryTime}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(printHtml);
      w.document.close();
      setTimeout(() => {
        w.print();
        w.close();
      }, 300);
    }

    setPrintHistory([
      `[IN THẺ VÀO] Xe: ${vehicleData.licensePlate} - Tài xế: ${vehicleData.driverName} (${new Date().toLocaleTimeString("vi-VN")})`,
      ...printHistory,
    ]);
    
    setVehicleData(null);
    setEventUid("");
    setSessionStatus("");
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* KHU VỰC HEADER ĐIỀU HƯỚNG */}
      <Box
        sx={{
          mb: 4,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => navigate("/camera-overview")}
              sx={{
                color: theme.palette.primary.main,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h5"
              component="h1"
              sx={{ color: theme.palette.primary.main, fontWeight: "bold", fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
            >
              CỔNG VÀO: ĐỊNH DANH TÀI XẾ
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, ml: 6 }}>
            {isLoading && <CircularProgress size={14} />}
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {sessionStatus
                ? `Tiến trình: ${sessionStatus}`
                : "Hệ thống đang sẵn sàng, chờ quét hoặc tải tệp ảnh CCCD..."}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <CustomButton
            variant="contained"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => fileInputRef.current?.click()}
            isLoading={isLoading}
            fullWidth
          >
            ĐĂNG KÝ NGƯỜI (CCCD)
          </CustomButton>
        </Box>
      </Box>

      {/* KHU VỰC HIỂN THỊ NỘI DUNG CHÍNH */}
      {!vehicleData ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Hiện tại chưa có hồ sơ. Vui lòng nhấn nút <b>"Đăng ký người (CCCD)"</b> để tiến hành trích xuất dữ liệu.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ flex: { xs: "1 1 100%", lg: "0 0 calc(33.33% - 16px)" } }}>
              <CccdInfo
                data={vehicleData}
                onUpdateField={handleUpdateVehicleField}
              />
            </Box>
            <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 calc(66.66% - 16px)" } }}>
              <CameraInfo data={vehicleData} />
            </Box>
          </Box>
          
          {/* THANH THAO TÁC XÁC THỰC LỆNH */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
            <CustomButton
              variant="contained"
              size="large"
              color="secondary"
              startIcon={<VerifiedUserIcon />}
              onClick={() => setIsOpenCompareModal(true)}
              disabled={!eventUid || isLoading}
            >
              XÁC THỰC KHUÔN MẶT
            </CustomButton>
            <CustomButton
              variant="contained"
              size="large"
              color="success"
              startIcon={<PrintIcon />}
              onClick={handlePrintCard}
              disabled={sessionStatus !== "SUCCESS_MATCH" || isLoading}
            >
              XÁC NHẬN & IN THẺ VÀO
            </CustomButton>
          </Box>
        </Box>
      )}

      {/* NHẬT KÝ IN ẤN HỆ THỐNG TRONG PHIÊN */}
      <Box sx={{ mt: 3 }}>
        <HistoryLog history={printHistory} />
      </Box>

      {/* COMPONENT ĐỐI SÁNH TRỰC QUAN */}
      <FaceCompareModal
        open={isOpenCompareModal}
        onClose={() => setIsOpenCompareModal(false)}
        vehicleData={vehicleData}
        eventUid={eventUid}
        onCompareSuccess={() => setSessionStatus("SUCCESS_MATCH")}
      />

      {/* TOAST THÔNG BÁO TRẠNG THÁI TOÀN CỤC */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}