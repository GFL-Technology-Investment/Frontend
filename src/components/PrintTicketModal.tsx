import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axiosInstance from "../configs/axios";

interface PrintTicketModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  onConfirmSuccess: (ticketCode: string) => void;
}

export default function PrintTicketModal({ open, onClose, ticketId, onConfirmSuccess }: PrintTicketModalProps) {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [ticketImages, setTicketImages] = useState<{ front: string; back: string } | null>(null);
  const [currentTicketCode, setCurrentTicketCode] = useState<string>("");

  const handleTriggerPrintApi = async () => {
    if (!ticketId) return;
    try {
      setIsPrinting(true);
      setTicketImages(null);

      const response = await axiosInstance.post(`/api/v1/tickets/${ticketId}/print`);

      if (response.data?.status === "SUCCESS") {
        const ticket = response.data.data?.ticket;
        setCurrentTicketCode(ticket?.ticket_code || "UNKNOWN");
        setTicketImages({
          front: ticket?.front_image_url || "",
          back: ticket?.back_image_url || ""
        });
      }
    } catch (error) {
      console.error("Lỗi khi gửi lệnh in đến máy chủ:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (open) {
      handleTriggerPrintApi();
    }
  }, [open, ticketId]);

  const handleActionConfirm = () => {
    onConfirmSuccess(currentTicketCode);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setTicketImages(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={isPrinting ? undefined : handleCloseModal}
      maxWidth="md"
      fullWidth
    >
      <Box sx={{ p: 1, borderRadius: 3 }}>
        <DialogTitle sx={{ fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Preview Phôi Vé Đã Khởi Tạo</Typography>
          <IconButton onClick={handleCloseModal} size="small" disabled={isPrinting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ minHeight: 180 }}>
          {isPrinting ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 4, gap: 2 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Hệ thống đang kết nối phần cứng máy in và giả lập thẻ...
              </Typography>
            </Box>
          ) : ticketImages ? (
            <Box>
              <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: "bold", mb: 3 }}>
                ✓ Đã hoàn tất lệnh gửi dữ liệu sang máy in thành công. Vui lòng đối soát phôi thẻ:
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
                {/* Mặt trước thẻ */}
                <Box sx={{ textAlign: "center", flex: "1 1 300px", maxWidth: 380 }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 1, color: "text.secondary" }}>
                    MẶT TRƯỚC VÉ
                  </Typography>
                  <Box
                    component="img"
                    src={ticketImages.front}
                    alt="Mặt trước"
                    sx={{ width: "100%", height: "auto", borderRadius: 2, boxShadow: 2, border: "1px solid #e0e0e0" }}
                    onError={(e: any) => { e.target.src = "https://placehold.co/400x250?text=Loi+Link+Anh+Mat+Truoc"; }}
                  />
                </Box>

                {/* Mặt sau thẻ */}
                <Box sx={{ textAlign: "center", flex: "1 1 300px", maxWidth: 380 }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 1, color: "text.secondary" }}>
                    MẶT SAU VÉ
                  </Typography>
                  <Box
                    component="img"
                    src={ticketImages.back}
                    alt="Mặt sau"
                    sx={{ width: "100%", height: "auto", borderRadius: 2, boxShadow: 2, border: "1px solid #e0e0e0" }}
                    onError={(e: any) => { e.target.src = "https://placehold.co/400x250?text=Loi+Link+Anh+Mat+Sau"; }}
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="error" align="center" sx={{ py: 3 }}>
              Lỗi nạp luồng hình ảnh thẻ từ hệ thống hoặc Ticket ID không hợp lệ.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={handleCloseModal} disabled={isPrinting} sx={{ borderRadius: 2 }}>
            Cancel (Hủy bỏ)
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleActionConfirm}
            disabled={isPrinting || !ticketImages}
            sx={{ borderRadius: 2, px: 3, fontWeight: "bold" }}
          >
            Xác nhận hoàn thành
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}