import { Box, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import axiosInstance from "../../configs/axios";

// Import các sub-components sạch sẽ
import KpiCards from "./components/KpiCard";
import CameraMonitoring from "./components/CameraMonitoring";
import FleetStatus from "./components/FleetStatus";
import TimelineAccess from "./components/TimelineAccess";
import QuickStats from "./components/QuickStats";
import AlertsPanel from "./components/AlertsPanel";

interface TimelineItem {
  time: string;
  text: string;
  isError: boolean;
}

export default function DashboardPage() {
  const theme = useTheme();

  // --- QUẢN LÝ TRẠNG THÁI REAL-TIME ---
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [vehiclesInAirport, setVehiclesInAirport] = useState<number>(0);
  const [vehiclesCheckedOut, setVehiclesCheckedOut] = useState<number>(0);
  const [timelineRecords, setTimelineRecords] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- STATE CHO MỤC THỐNG KÊ NHANH ---
  const [rfidSuccessRate, setRfidSuccessRate] = useState<string>("100%");
  const [totalCheckedIn, setTotalCheckedIn] = useState<number>(0);
  const [totalCheckedOut, setTotalCheckedOut] = useState<number>(0);
  const [dynamicChartData, setDynamicChartData] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const response = await axiosInstance.get("/api/v1/access/history", {
          params: { page: 1, limit: 50 }
        });

        if (!isMounted) return;

        const allLogs = response.data?.data || [];

        const onlyVehicleLogs = allLogs.filter(
          (log: any) => log.vehicle_event_uid !== null && log.vehicle_event_uid !== undefined
        );

        // Phân tích dữ liệu cho Timeline
        if (Array.isArray(onlyVehicleLogs)) {
          const formattedTimeline = onlyVehicleLogs.slice(0, 10).map((log: any) => {
            const timeStr = log.detected_at ? log.detected_at.split(" ")[1]?.substring(0, 5) : "—:—";
            const identity = `Xe [${log.plate?.number || "Không rõ BS"}]`;
            const action = log.status === "CHECKED_IN" ? "đã vào" : "đã rời";
            const location = log.gate_name || "Cổng kiểm soát";
            const isError = !log.plate?.number;

            return {
              time: timeStr,
              text: `${identity} ${action} ${location}`,
              isError: isError
            };
          });
          setTimelineRecords(formattedTimeline);
        }

        // Tính toán các chỉ số thống kê & Biểu đồ giờ
        let countInAirport = 0;
        let countCheckedOut = 0;
        let rfidValidCount = 0;

        const hourlyGroups: { [key: string]: number } = { 
          "08h": 0, "09h": 0, "10h": 0, "11h": 0, "12h": 0, 
          "13h": 0, "14h": 0, "15h": 0, "16h": 0, "17h": 0 
        };

        onlyVehicleLogs.forEach((log: any) => {
          if (log.status === "CHECKED_IN") {
            countInAirport++;
          } else if (log.status === "CHECKED_OUT") {
            countCheckedOut++;
          }

          if (log.plate && log.plate.number && log.plate.number !== "—" && log.plate.number !== "") {
            rfidValidCount++;
          } else if (log.rfid_status === "SUCCESS" || log.rfid_card) {
            rfidValidCount++;
          }

          if (log.detected_at) {
            const hour = log.detected_at.split(" ")[1]?.substring(0, 2);
            if (hour) {
              const hourKey = `${hour}h`;
              if (hourlyGroups[hourKey] !== undefined) {
                hourlyGroups[hourKey]++;
              } else {
                hourlyGroups[hourKey] = 1;
              }
            }
          }
        });

        setTotalVehicles(onlyVehicleLogs.length);
        setVehiclesInAirport(countInAirport);
        setVehiclesCheckedOut(countCheckedOut);
        setTotalCheckedIn(countInAirport);
        setTotalCheckedOut(countCheckedOut);

        const rate = onlyVehicleLogs.length > 0 ? Math.round((rfidValidCount / onlyVehicleLogs.length) * 100) : 100;
        setRfidSuccessRate(`${rate}%`);

        const formattedChartData = Object.keys(hourlyGroups)
          .sort()
          .map((key) => ({
            name: key,
            value: hourlyGroups[key],
          }));

        setDynamicChartData(formattedChartData);

      } catch (error) {
        console.error("Lỗi khi đồng bộ dữ liệu giám sát luồng xe:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      
      {/* 1. KHU VỰC THẺ THÔNG SỐ (KPI TOP CARDS) */}
      <KpiCards 
        isLoading={isLoading}
        totalVehicles={totalVehicles}
        vehiclesInAirport={vehiclesInAirport}
        vehiclesCheckedOut={vehiclesCheckedOut}
      />

      {/* 2. KHU VỰC CAMERA RA VÀO CỔNG & FLEET STATUS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <CameraMonitoring />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <FleetStatus />
        </Grid>
      </Grid>

      {/* 3. KHU VỰC THỜI GIAN, THỐNG KÊ NHANH & CẢNH BÁO */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TimelineAccess isLoading={isLoading} timelineRecords={timelineRecords} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <QuickStats 
            isLoading={isLoading} 
            dynamicChartData={dynamicChartData} 
            rfidSuccessRate={rfidSuccessRate} 
            totalCheckedIn={totalCheckedIn} 
            totalCheckedOut={totalCheckedOut} 
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AlertsPanel />
        </Grid>
      </Grid>

    </Box>
  );
}