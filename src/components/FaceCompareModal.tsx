// components/FaceCompareModal.tsx
import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import axiosInstance from "../configs/axios";
import type { XitecLog } from "../types/vehicle";
import type { ToastState } from "./ToastNotification";
import ToastNotification from "./ToastNotification";

interface ImageState {
  file: File | null;
  preview: string;
}

interface FaceCompareModalProps {
  open: boolean;
  onClose: () => void;
  vehicleData: XitecLog | null;
  eventUid: string;
  onCompareSuccess: (matchedData?: any) => void;
  defaultLiveFace?: ImageState;
}

export default function FaceCompareModal({
  open,
  onClose,
  vehicleData,
  eventUid,
  onCompareSuccess,
  defaultLiveFace,
}: FaceCompareModalProps) {
  const theme = useTheme();
  const liveFaceInputRef = useRef<HTMLInputElement>(null);

  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [liveFaceFile, setLiveFaceFile] = useState<File | null>(null);
  const [liveFacePreview, setLiveFacePreview] = useState<string>("");
  const [compareResult, setCompareResult] = useState<any>(null);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showToast = (message: string, severity: ToastState['severity'] = 'success') => {
    setToast({ open: true, message, severity });
  };

  useEffect(() => {
    if (open && defaultLiveFace?.file) {
      setLiveFaceFile(defaultLiveFace.file);
      setLiveFacePreview(defaultLiveFace.preview);
    } else if (!open) {
      setCompareResult(null);
    }
  }, [open, defaultLiveFace]);

  useEffect(() => {
    return () => {
      if (liveFacePreview && liveFacePreview !== defaultLiveFace?.preview) {
        URL.revokeObjectURL(liveFacePreview);
      }
    };
  }, [liveFacePreview, defaultLiveFace]);

  const handleLiveFaceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (liveFacePreview && liveFacePreview !== defaultLiveFace?.preview) {
        URL.revokeObjectURL(liveFacePreview);
      }
      setLiveFaceFile(file);
      setLiveFacePreview(URL.createObjectURL(file));
    }
  };

  const handleCompareFaces = async () => {
    if (!liveFaceFile) {
      showToast("Vui lòng chọn hoặc chụp ảnh thực tế!", "warning");
      return;
    }
    if (!eventUid) {
      showToast("Không tìm thấy Event UID hợp lệ!", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("live_face_image", liveFaceFile);
    formData.append("event_uid", eventUid);

    try {
      setIsComparing(true);
      const response = await axiosInstance.post(
        "/api/v1/face/compare",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setCompareResult(response.data);
      const compareInfo = response.data?.data?.compare || response.data?.compare;
      const compareResultStatus = String(compareInfo?.result || "").trim().toUpperCase();

      // 🟢 ĐÃ SỬA LOGIC: Kiểm tra chính xác chuỗi kết quả trùng khớp nghiệp vụ sinh trắc học
      if (compareResultStatus === "MATCH") {
        showToast("Xác thực khuôn mặt trùng khớp thành công!", "success");
        onCompareSuccess(response.data?.data || response.data);
      } else {
        // Trả thông báo lỗi màu đỏ khi kết quả là NO_MATCH hoặc các trạng thái không khớp khác
        showToast(
          `Đối sánh hoàn tất! Kết quả: ${compareInfo?.result === "NO_MATCH" ? "Không trùng khớp khuôn mặt" : (compareInfo?.result || "Không khớp")}`, 
          "error"
        );
      }
    } catch (error) {
      showToast("Không thể kết nối đến API đối sánh khuôn mặt.", "error");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
        HỆ THỐNG ĐỐI SÁNH XÁC THỰC KHUÔN MẶT TÀI XẾ
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mt: 1 }}>
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Số CCCD"
              fullWidth
              value={vehicleData?.id || ""}
              slotProps={{ input: { readOnly: true } }}
            />
            <TextField
              label="Họ và Tên tài xế"
              fullWidth
              value={vehicleData?.name || ""}
              slotProps={{ input: { readOnly: true } }}
            />
            <TextField
              label="Ngày sinh"
              fullWidth
              value={vehicleData?.birth || ""}
              slotProps={{ input: { readOnly: true } }}
            />
            <TextField
              label="Nơi thường trú"
              fullWidth
              multiline
              rows={2}
              value={vehicleData?.place || ""}
              slotProps={{ input: { readOnly: true } }}
            />

            {compareResult && (
              <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1, border: "1px solid #ccc" }}>
                <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: "bold" }}>
                  Kết quả đối sánh từ Server:
                </Typography>
                <Typography variant="body2">
                  - Tỷ lệ trùng khớp:{" "}
                  {compareResult?.data?.compare?.score
                    ? `${(compareResult.data.compare.score * 100).toFixed(1)}%`
                    : "N/A"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    color: compareResult?.data?.compare?.result === "MATCH" ? "#4caf50" : "#f44336",
                  }}
                >
                  - Kết luận: {compareResult?.data?.compare?.result || "Chờ duyệt"}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ width: { xs: "100%", md: "280px" }, display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
            <Box sx={{ textAlign: "center", width: "100%" }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                Ảnh chân dung CCCD
              </Typography>
              <img
                src={vehicleData?.driverFaceImage}
                alt="CCCD Face"
                style={{ width: "150px", height: "180px", objectFit: "cover", borderRadius: "4px" }}
              />
            </Box>

            <Box sx={{ textAlign: "center", width: "100%" }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                Ảnh thực tế (Live Face)
              </Typography>
              <Box
                onClick={() => liveFaceInputRef.current?.click()}
                sx={{
                  width: "150px",
                  height: "180px",
                  border: `2px dashed ${theme.palette.primary.main}`,
                  borderRadius: "4px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  bgcolor: "action.hover",
                  margin: "0 auto",
                }}
              >
                {liveFacePreview ? (
                  <img
                    src={liveFacePreview}
                    alt="Live Face"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <CloudUploadIcon color="primary" />
                )}
              </Box>
              <input
                type="file"
                accept="image/*"
                ref={liveFaceInputRef}
                style={{ display: "none" }}
                onChange={handleLiveFaceChange}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          ĐÓNG MÀN HÌNH
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={isComparing ? <CircularProgress size={20} color="inherit" /> : <VerifiedUserIcon />}
          onClick={handleCompareFaces}
          disabled={isComparing}
          sx={{ color: "#ffffff !important" }}
        >
          {isComparing ? "ĐANG ĐỐI SÁNH..." : "COMPARE (SO SÁNH)"}
        </Button>
      </DialogActions>

      <ToastNotification
        toast={toast}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Dialog>
  );
}
