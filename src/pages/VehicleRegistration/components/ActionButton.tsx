import { useState } from "react";
import { Box, Button, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PrintIcon from "@mui/icons-material/Print";
import CustomButton from "../../../components/CustomButton";

import PrintTicketModal from "../../../components/PrintTicketModal";

interface ActionButtonsProps {
  eventUid: string;
  sessionStatus: string;
  ticketId: string;
  onBack: () => void;
  onOpenCompare: () => void;
  onPrintSuccess: (ticketCode: string) => void; // 🌟 Nâng cấp nhận mã vé trả về để ghi log
}

export default function ActionButtons({
  eventUid,
  sessionStatus,
  ticketId,
  onBack,
  onOpenCompare,
  onPrintSuccess,
}: ActionButtonsProps) {
  const theme = useTheme();

  // 🌟 State quản lý trạng thái hiển thị modal in vé
  const [isOpenPrintModal, setIsOpenPrintModal] = useState<boolean>(false);

  // Hàm xử lý trung gian khi click nút "Xác nhận & In thẻ vào"
  const handleTriggerOpenPrintModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpenPrintModal(true);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ fontWeight: "bold", border: `1px solid ${theme.palette.divider}`, fontSize: "13px" }}
      >
        QUAY LẠI FORM ĐĂNG KÝ
      </Button>
      
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <CustomButton
          variant="contained"
          startIcon={<VerifiedUserIcon />}
          onClick={onOpenCompare}
          disabled={!eventUid}
          sx={{ fontWeight: "bold", color: "#fff !important" }}
        >
          XÁC THỰC KHUÔN MẶT
        </CustomButton>
        
        <CustomButton
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handleTriggerOpenPrintModal} // 🌟 Gọi Modal hiển thị preview thay vì trigger callback ngay lập tức
          disabled={sessionStatus !== "SUCCESS_MATCH" || !ticketId} // Khóa nút nếu chưa khớp mặt hoặc thiếu id vé
          sx={{ fontWeight: "bold", bgcolor: "success.main", color: "#ffffff" }}
        >
          XÁC NHẬN & IN THẺ VÀO
        </CustomButton>
      </Box>

      {/* 🌟 TÍCH HỢP MODAL IN THẺ TÁI SỬ DỤNG */}
      <PrintTicketModal
        open={isOpenPrintModal}
        onClose={() => setIsOpenPrintModal(false)}
        ticketId={ticketId}
        onConfirmSuccess={onPrintSuccess} // Trả ngược thông tin ra ngoài tầng cha khi hoàn tất
      />
    </Box>
  );
}