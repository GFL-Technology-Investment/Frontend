import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  IconButton,
  Alert,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LockPatternIcon from "@mui/icons-material/Lock"; // Import thêm icon cảnh báo
import { useNavigate } from "react-router-dom";

import type { XitecLog } from "../../types/vehicle";
import CccdInfo from "./components/CccdInfo";
import CameraInfo from "./components/CameraInfo";
import HistoryLog from "./components/HistoryLog";
import FaceCompareModal from "../../components/FaceCompareModal";
import CustomButton from "../../components/CustomButton";
import axiosInstance from "../../configs/axios";
import ToastNotification, {
  type ToastState,
} from "../../components/ToastNotification";
import {Can} from "../../components/common/Can";

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
    message: "",
    severity: "success",
  });

  const showToast = (
    message: string,
    severity: ToastState["severity"] = "success",
  ) => {
    setToast({ open: true, message, severity });
  };

  // 🌟 KHỬ RÒ RỈ BỘ NHỚ RAM (Garbage Collection cho Blob URL)
  useEffect(() => {
    return () => {
      if (
        vehicleData?.nationalIdImage &&
        vehicleData.nationalIdImage.startsWith("blob:")
      ) {
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
    if (
      vehicleData?.nationalIdImage &&
      vehicleData.nationalIdImage.startsWith("blob:")
    ) {
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

      if (response.data?.status === "SUCCESS") {
        const ocrData = response.data.data;
        const linkedSession = response.data.linked_session;
        const currentEventUid =
          linkedSession?.event_uid || response.data.event_uid || "";

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
          driverFaceImage:
            ocrData?.cccd_face_image_url || "data:image/png;base64,...",
          entryTime: linkedSession?.created_at
            ? new Date(linkedSession.created_at).toLocaleString("vi-VN")
            : new Date().toLocaleString("vi-VN"),
        });

        showToast(
          "Định danh tài xế và phân tích dữ liệu OCR thành công!",
          "success",
        );

        if (currentEventUid) {
          setIsOpenCompareModal(true);
        }
      }
    } catch (error: any) {
      console.error(
        ">>> [API ERROR OCR VECHILE-IN]:",
        error.response?.data || error.message,
      );
      showToast("Thất bại khi kết nối máy chủ xử lý dữ liệu OCR.", "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsLoading(false);
    }
  };

  // Thêm state lưu ticket sau khi issue
  const [ticketData, setTicketData] = useState<{
    ticket_id: string;
    front_image_url: string;
    back_image_url: string;
    ticket_code: string;
  } | null>(null);

  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const handlePrintCard = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!vehicleData || !eventUid) return;

    try {
      setIsPrinting(true);

      // Bước 1: Issue vé nếu chưa có
      let ticket = ticketData;
      if (!ticket) {
        const issueForm = new FormData();
        issueForm.append("event_uid", eventUid);
        issueForm.append("ticket_type", "VEHICLE_PASS");
        issueForm.append("issued_by", "guard-001");

        const issueRes = await axiosInstance.post(
          "/api/v1/tickets/issue",
          issueForm,
        );
        if (issueRes.data?.status !== "SUCCESS") {
          showToast("Không thể tạo vé, vui lòng thử lại.", "error");
          return;
        }

        const issued = issueRes.data.data;
        ticket = {
          ticket_id: issued.ticket_id,
          front_image_url: issued.front_image_url,
          back_image_url: issued.back_image_url,
          ticket_code: issued.ticket_code,
        };
        setTicketData(ticket);
      }

      // Bước 2: Gọi API đánh dấu đã in
      const printForm = new FormData();
      printForm.append("printer_name", "GUARD_PRINTER");
      printForm.append("printed_by", "guard-001");
      await axiosInstance.post(
        `/api/v1/tickets/${ticket.ticket_id}/print`,
        printForm,
      );

      // Bước 3: Mở cửa sổ in với ảnh mặt trước + mặt sau từ server
      const printHtml = `
      <html>
        <head>
          <title>VÉ XE - ${ticket.ticket_code}</title>
          <style>
            body {
              margin: 0;
              padding: 16px;
              background: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
            }
            img {
              max-width: 640px;
              width: 100%;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            @media print {
              body { padding: 0; gap: 8px; }
              img { box-shadow: none; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <img src="${ticket.front_image_url}" alt="Mặt trước vé" />
          <img src="${ticket.back_image_url}" alt="Mặt sau vé" />
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); window.close(); }, 400);
            };
          </script>
        </body>
      </html>
    `;

      const w = window.open("", "_blank");
      if (w) {
        w.document.write(printHtml);
        w.document.close();
      }

      setPrintHistory([
        `[IN VÉ] Mã: ${ticket.ticket_code} - Xe: ${vehicleData.licensePlate} - Tài xế: ${vehicleData.driverName} (${new Date().toLocaleTimeString("vi-VN")})`,
        ...printHistory,
      ]);

      showToast(`In vé ${ticket.ticket_code} thành công!`, "success");

      // Reset sau khi in xong
      setTimeout(() => {
        setVehicleData(null);
        setEventUid("");
        setSessionStatus("");
        setTicketData(null);
      }, 1000);
    } catch (error: any) {
      console.error(
        ">>> [API ERROR PRINT TICKET]:",
        error.response?.data || error.message,
      );
      showToast("Lỗi khi tạo hoặc in vé, vui lòng thử lại.", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Can
      perform="vehicle.approve"
      fallback={
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            p: 3,
          }}
        >
          <Alert severity="error" icon={<LockPatternIcon fontSize="large" />}>
            <Typography variant="h6">Truy cập bị từ chối</Typography>
            <Typography variant="body2">
              Bạn không có quyền thực hiện chức năng này. Vui lòng liên hệ quản trị viên.
            </Typography>
          </Alert>
        </Box>
      }
    >
      <Box
        sx={{
          bgcolor: theme.palette.background.default, // Chuẩn hóa Token hệ thống
          minHeight: "100vh",
          p: { xs: 2, sm: 3 },
        }}
      >
        {/* KHU VỰC HEADER ĐIỀU HƯỚNG */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`, // Chuẩn hóa Token hệ thống
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
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: "bold",
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                }}
              >
                CỔNG VÀO: ĐỊNH DANH TÀI XẾ
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, ml: 6 }}
            >
              {isLoading && <CircularProgress size={14} />}
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
              >
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
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.secondary }}
            >
              Hiện tại chưa có hồ sơ. Vui lòng nhấn nút{" "}
              <b>"Đăng ký người (CCCD)"</b> để tiến hành trích xuất dữ liệu.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box
                sx={{ flex: { xs: "1 1 100%", lg: "0 0 calc(33.33% - 16px)" } }}
              >
                <CccdInfo
                  data={vehicleData}
                  onUpdateField={handleUpdateVehicleField}
                />
              </Box>
              <Box
                sx={{ flex: { xs: "1 1 100%", lg: "1 1 calc(66.66% - 16px)" } }}
              >
                <CameraInfo data={vehicleData} />
              </Box>
            </Box>

            {/* THANH THAO TÁC XÁC THỰC LỆNH */}
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
            >
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
                disabled={
                  sessionStatus !== "SUCCESS_MATCH" || isLoading || isPrinting
                }
                isLoading={isPrinting}
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
    </Can>
  );
}