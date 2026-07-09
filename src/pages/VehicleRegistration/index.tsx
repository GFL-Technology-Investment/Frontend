import { useState } from "react";
import type { FormEvent } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import { CheckCircleOutlined as CheckCircleOutlineIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CustomButton from "../../components/CustomButton";
import CccdInfo from "../VehicleIn/components/CccdInfo";
import CameraInfo from "../VehicleIn/components/CameraInfo";
import DriverIdentityModal from "./components/DriverIdentityModal";
import FaceCompareModal from "../../components/FaceCompareModal";
import ToastNotification from "../../components/ToastNotification";
import type { XitecLog } from "../../types/vehicle";
import type { ToastState } from "../../components/ToastNotification";


import VehicleOwnerForm from "./components/VehicleOwnerForm";
import VehicleInfoForm from "./components/VehicleInfoForm";
import ActionButtons from "./components/ActionButton";
import { useVehicleImages } from "../../hooks/useVehicleImage";
import { submitVehicleRegistration, checkVehicleInsideStatus } from "../../services/VehicleService";

export default function VehicleRegistrationPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. Sử dụng Custom Hook quản lý ảnh
  const { images, refs, handleImageChange, handleRemoveImage, resetImages } = useVehicleImages();

  // 2. State điều khiển luồng dữ liệu chính - Định nghĩa chuẩn định dạng XitecLog
  const [vehicleData, setVehicleData] = useState<XitecLog | null>(null);
  const [eventUid, setEventUid] = useState<string>("");
  const [sessionStatus, setSessionStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenPersonModal, setIsOpenPersonModal] = useState<boolean>(false);
  const [isOpenCompareModal, setIsOpenCompareModal] = useState<boolean>(false);

  // 3. State quản lý form text chính
  const [formData, setFormData] = useState({
    licensePlate: "",
    ticketType: "Thang",
    ownerName: "",
    ownerId: "",
    ownerPhone: "",
    notes: "",
  });
  const [errors, setErrors] = useState({ licensePlate: "" });

  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success' });
  const showToast = (message: string, severity: ToastState['severity'] = 'success') => {
    setToast({ open: true, message, severity });
  };

  const extractTicketId = (data: any): string => {
    return data?.ticketId ||
      data?.ticket_id ||
      data?.ticket?.ticket_id ||
      data?.linked_session?.ticket?.ticket_id ||
      data?.linkedSession?.ticket?.ticket_id ||
      data?.session?.ticket?.ticket_id ||
      data?.data?.ticketId ||
      data?.data?.ticket_id ||
      data?.data?.ticket?.ticket_id ||
      data?.data?.linked_session?.ticket?.ticket_id ||
      "";
  };

  const handleTextChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: field === "licensePlate" ? e.target.value.toUpperCase() : e.target.value,
    });
    if (field === "licensePlate" && e.target.value.trim() !== "") setErrors({ licensePlate: "" });
  };

  const handleBackToRegistration = () => {
    resetImages();
    setVehicleData(null);
    setSessionStatus("");
    setEventUid("");
    setFormData({ licensePlate: '', ticketType: 'Thang', ownerName: '', ownerId: '', ownerPhone: '', notes: '' });
    setErrors({ licensePlate: '' });
  };

  const handlePrintSuccessCallback = (ticketCode: string) => {
    showToast(`Cấp phát thành công thẻ kiểm soát định kỳ! Mã vé: ${ticketCode}`, "success");
    handleBackToRegistration();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const targetPlate = formData.licensePlate.trim().toUpperCase();
    if (!targetPlate) {
      setErrors({ licensePlate: "Biển số xe không được để trống!" });
      return;
    }

    if (!images.plate.file || !images.vehicle.file) {
      showToast("Vui lòng tải lên Ảnh Biển Số và Ảnh Toàn Xe!", "warning");
      return;
    }

    try {
      setIsLoading(true);

      console.log(`>>> [CHECKING PLATE]: Đang đối soát biển số: ${targetPlate}`);
      const isInside = await checkVehicleInsideStatus(targetPlate);

      if (isInside) {
        setIsLoading(false);
        showToast(`LỖI: Xe ${targetPlate} hiện đang ở trong bến (Trạng thái: Chưa Checkout)! Không thể tiếp tục đăng ký.`, "error");
        setIsOpenPersonModal(false);

        setTimeout(() => {
          navigate("/camera-overview");
        }, 2000);
        return;
      }

      console.log(">>> [REGISTRATION]: Xe hợp lệ, tiến hành gửi dữ liệu lên AI Box...");
      const result = await submitVehicleRegistration(targetPlate, images, user?.organizationId);

      if (result && result.event_uid) {
        setEventUid(result.event_uid);
        setIsOpenPersonModal(true);
      } else {
        throw new Error("Không nhận được Event UID từ hệ thống định danh!");
      }

    } catch (error: any) {
      setIsLoading(false);
      console.error(">>> [SUBMIT ERROR]:", error);

      if (error.message?.includes("đang trong bến") || error.response?.data?.detail?.includes("already inside")) {
        showToast(`Từ chối: Xe ${targetPlate} đã có phiên chưa kết thúc trong bến!`, "error");
        setTimeout(() => navigate("/camera-overview"), 2000);
      } else {
        showToast(error.message || "Không thể kết nối đến máy chủ API bốt xe!", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", p: 0 }}>
      {/* HEADER TIÊU ĐỀ */}
      <Box sx={{ mb: 3, pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "center", gap: 2 }}>
        <AppRegistrationIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
        <Box>
          <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: "bold", lineHeight: 1.2 }}>
            HỆ THỐNG CẤP PHÁT & ĐĂNG KÝ VÉ XE ĐỊNH KỲ
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {vehicleData ? `Trạng thái phiên kết nối: ${sessionStatus}` : "Đăng ký thông tin tài xế và phương tiện."}
          </Typography>
        </Box>
      </Box>

      {/* VIEW FORM CHƯA CÓ KẾT QUẢ */}
      {!vehicleData ? (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <VehicleOwnerForm formData={formData} onChange={handleTextChange} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <VehicleInfoForm
                formData={formData}
                errors={errors}
                images={images}
                refs={refs}
                onChange={handleTextChange}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
              />
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <CustomButton type="submit" variant="contained" isLoading={isLoading} sx={{ fontWeight: "bold", px: 4, py: 1.2 }}>
                HOÀN TẤT ĐĂNG KÝ XE
              </CustomButton>
            </Grid>
          </Grid>
        </Box>
      ) : (
        /* VIEW HIỂN THỊ KẾT QUẢ ĐỒNG BỘ */
        <Box sx={{ mt: 0 }}>
          <ActionButtons
            eventUid={eventUid}
            sessionStatus={sessionStatus}
            ticketId={vehicleData.ticketId || vehicleData.ticket?.ticket_id || ""}
            onBack={handleBackToRegistration}
            onOpenCompare={() => setIsOpenCompareModal(true)}
            onPrintSuccess={handlePrintSuccessCallback}
          />

          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CheckCircleOutlineIcon color="success" fontSize="small" /> KẾT QUẢ ĐỒNG BỘ DỮ LIỆU TỪ HỆ THỐNG OCR & BIOMETRIC
          </Typography>

          <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
            <Box sx={{ flex: { xs: "1 1 100%", lg: "0 0 calc(33.33% - 16px)" } }}>
              <CccdInfo data={vehicleData} onUpdateField={(f, v) => setVehicleData((prev) => (prev ? { ...prev, [f]: v } : null))} />
            </Box>
            <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 calc(66.66% - 16px)" } }}>
              <CameraInfo data={vehicleData} />
            </Box>
          </Box>
        </Box>
      )}

      {/* POPUP MODALS & TOAST */}
      <DriverIdentityModal
        open={isOpenPersonModal}
        onClose={() => setIsOpenPersonModal(false)}
        eventId={eventUid}
        licensePlate={formData.licensePlate}
        ownerId={formData.ownerId}
        ownerName={formData.ownerName}
        onOcrSuccess={(data: any, status: string) => {
          // Kiểm tra tất cả các trường hợp có thể có của ticket_id từ API trả về
          const extractedTicketId = extractTicketId(data);

          console.log(">>> [DEBUG TICKET ID EXTRACTED]:", extractedTicketId);

          const refinedData: XitecLog = {
            ...data,
            ticketId: extractedTicketId
          };
          setVehicleData(refinedData);
          setSessionStatus(status);
        }}
      />

      <FaceCompareModal
        open={isOpenCompareModal}
        onClose={() => setIsOpenCompareModal(false)}
        vehicleData={vehicleData!}
        eventUid={eventUid}
        // Sửa lại nhận thêm data trả về từ kết quả đối sánh (nếu có)
        onCompareSuccess={(matchedData?: any) => {
          setSessionStatus("SUCCESS_MATCH");

          // Nếu API compare trả ra data mới, bóc tách lại ticketId
          if (matchedData) {
            const finalTicketId = extractTicketId(matchedData) || vehicleData?.ticketId || vehicleData?.ticket?.ticket_id || "";
            setVehicleData((prev: any) => ({
              ...prev,
              ...matchedData,
              ticketId: finalTicketId
            }));
          }
        }}
        defaultLiveFace={images.face.file ? images.face : undefined}
      />

      <ToastNotification toast={toast} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
