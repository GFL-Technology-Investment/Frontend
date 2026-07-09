import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import type { XitecLog } from "../../../types/vehicle";
import type { ToastState } from "../../../components/ToastNotification";
import ToastNotification from "../../../components/ToastNotification";

// Định nghĩa cấu hình Base URL tập trung
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

interface DriverIdentityModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  licensePlate: string;
  ownerId: string;
  ownerName: string;
  onOcrSuccess: (data: XitecLog, sessionStatus: string) => void;
}

export default function DriverIdentityModal({
  open,
  onClose,
  eventId,
  licensePlate,
  onOcrSuccess,
}: DriverIdentityModalProps) {
  const theme = useTheme();
  const cccdInputRef = useRef<HTMLInputElement>(null);

  const [personLoading, setPersonLoading] = useState<boolean>(false);
  const [barcode, setBarcode] = useState<string>("");
  const [cccdFile, setCccdFile] = useState<File | null>(null);
  const [cccdPreview, setCccdPreview] = useState<string>("");

  // Khởi tạo state thông báo hệ thống thông minh
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showToast = (message: string, severity: ToastState['severity'] = 'success') => {
    setToast({ open: true, message, severity });
  };

  useEffect(() => {
    return () => {
      if (cccdPreview) URL.revokeObjectURL(cccdPreview);
    };
  }, [cccdPreview]);

  const handleCccdFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (cccdPreview) URL.revokeObjectURL(cccdPreview);
      setCccdFile(file);
      setCccdPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCccdFile = () => {
    if (cccdPreview) URL.revokeObjectURL(cccdPreview);
    setCccdFile(null);
    setCccdPreview("");
  };

  const handlePersonSubmit = async () => {
    if (!cccdFile) {
      return showToast("Vui lòng tải lên file ảnh CCCD tài xế!", "warning");
    }

    const token = localStorage.getItem("token");

    try {
      setPersonLoading(true);
      const ocrFormData = new FormData();
      ocrFormData.append("image", cccdFile);
      if (eventId) ocrFormData.append("event_uid", eventId);
      ocrFormData.append("plate_number", licensePlate);

      const response = await axios.post(
        `${API_BASE_URL}/ocr/cccd`,
        ocrFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token || ""}`,
          },
        },
      );

      if (response.data?.status === "SUCCESS") {
        const ocrData = response.data.data;
        const linkedSession = response.data.linked_session;
        const ticket = linkedSession?.ticket || response.data?.ticket || response.data?.data?.ticket;
        const ticketId = ticket?.ticket_id || linkedSession?.ticket_id || response.data?.ticket_id || "";

        const updatedVehicleData: XitecLog = {
          id: ocrData?.id || "Không rõ",
          name: ocrData?.name || "Không rõ",
          birth: ocrData?.birth || "",
          place: ocrData?.place || "",
          nationalId: ocrData?.id || "",
          driverName: ocrData?.name || "Không rõ",
          nationalIdImage: ocrData?.cccd_image_url || cccdPreview,
          licensePlate: licensePlate || linkedSession?.expected_plate_number || "ĐÃ GẮN XE",
          licensePlateImage: `${API_BASE_URL}/static/media/live_plate.jpg`,
          driverFaceImage: ocrData?.cccd_face_image_url || "data:image/png;base64,...",
          ticket,
          ticketId,
          entryTime: linkedSession?.created_at
            ? new Date(linkedSession.created_at).toLocaleString("vi-VN")
            : new Date().toLocaleString("vi-VN"),
        };

        showToast("Liên kết định danh sinh trắc CCCD và thông tin xe thành công!", "success");
        
        // Trì hoãn đóng modal một chút để người dùng kịp nhìn thấy Toast thành công
        setTimeout(() => {
          onOcrSuccess(updatedVehicleData, linkedSession?.status || "READY_TO_COMPARE");
          onClose();
        }, 800);

      } else {
        showToast(response.data?.message || "Không thể trích xuất dữ liệu OCR CCCD.", "error");
      }
    } catch (err: any) {
      console.error(">>> [DEBUG LỖI OCR CCCD]:", err.response?.data || err.message);
      const serverMsg = err.response?.data?.detail?.message || err.response?.data?.detail;
      showToast(
        `Thất bại khi kết nối máy chủ sinh trắc OCR: ${typeof serverMsg === "string" ? serverMsg : "Lỗi hệ thống"}`,
        "error"
      );
    } finally {
      setPersonLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={personLoading ? undefined : onClose} 
      fullWidth 
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "action.hover",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FingerprintIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "16px" }}>
            BƯỚC 2: ĐỊNH DANH SINH TRẮC TÀI XẾ & ĐỒNG BỘ HỒ SƠ
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={personLoading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent
        dividers
        sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        <TextField
          label="Event UID tự động"
          fullWidth
          disabled
          value={eventId}
        />
        <TextField
          label="Mã số Vé giấy / Số Barcode"
          fullWidth
          disabled={personLoading}
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <QrCodeScannerIcon color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <Box
            onClick={() => !cccdPreview && !personLoading && cccdInputRef.current?.click()}
            sx={{
              width: "100%",
              height: "140px",
              border: cccdPreview
                ? `1px solid ${theme.palette.divider}`
                : `2px dashed ${theme.palette.primary.main}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: personLoading ? "not-allowed" : "pointer",
              bgcolor: "action.hover",
              overflow: "hidden",
            }}
          >
            {cccdPreview ? (
              <>
                <img
                  src={cccdPreview}
                  alt="CCCD Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
                {!personLoading && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCccdFile();
                    }}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0, 0, 0, 0.6)",
                      color: theme.palette.common.white,
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" }
                    }}
                  >
                    <CancelIcon />
                  </IconButton>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: "center", opacity: personLoading ? 0.5 : 1 }}>
                <AddAPhotoIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: theme.palette.text.secondary }}>
                  Tải ảnh chụp CCCD
                </Typography>
              </Box>
            )}
          </Box>
          <input
            type="file"
            accept="image/*"
            ref={cccdInputRef}
            style={{ display: "none" }}
            onChange={handleCccdFileChange}
            disabled={personLoading}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={personLoading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePersonSubmit}
          disabled={personLoading}
          sx={{ fontWeight: "bold" }}
        >
          {personLoading ? "ĐANG XỬ LÝ OCR..." : "LIÊN KẾT ĐỊNH DANH HỆ THỐNG"}
        </Button>
      </DialogActions>

      {/* RENDER TOAST THÔNG BÁO ĐỒNG BỘ */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Dialog>
  );
}
