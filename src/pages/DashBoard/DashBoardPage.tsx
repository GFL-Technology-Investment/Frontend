import { Box, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import axiosInstance from "../../configs/axios";

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

const DASHBOARD_REFRESH_INTERVAL_MS = 3000;

const getLogTimestamp = (log: any): string => {
  const status = String(log?.status || "").trim().toUpperCase();

  if (status === "CHECKED_OUT") {
    return log?.checked_out_at || log?.detected_at || log?.updated_at || log?.created_at || "";
  }

  return log?.checked_in_at || log?.detected_at || log?.created_at || log?.updated_at || "";
};

const parseTimestamp = (value: string): number => {
  if (!value) return 0;

  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)) {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const [, year, month, day, hour, minute, second = "0"] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime();
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatTimelineTime = (value: string): string => {
  if (!value) return "--:--";

  const hasExplicitTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const localMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (localMatch && !hasExplicitTimezone) {
    const [, , , , hour, minute, second] = localMatch;
    return second ? `${hour}:${minute}:${second}` : `${hour}:${minute}`;
  }

  const timestamp = parseTimestamp(value);
  if (!timestamp) return "--:--";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
};

const getVehicleSubject = (log: any): string => {
  const plateNumber = log?.plate?.number || log?.expected_plate_number;

  if (plateNumber) return `Xe [${plateNumber}]`;
  return "Xe [Không rõ BS]";
};

const getLogAction = (log: any): string => {
  const status = String(log?.status || "").trim().toUpperCase();
  if (status === "CHECKED_OUT" || log?.checked_out_at) return "đã ra";
  if (status === "CHECKED_IN" || log?.checked_in_at) return "đã vào";
  return "có sự kiện tại";
};

export default function DashboardPage() {
  const theme = useTheme();

  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [vehiclesInAirport, setVehiclesInAirport] = useState<number>(0);
  const [vehiclesCheckedOut, setVehiclesCheckedOut] = useState<number>(0);
  const [timelineRecords, setTimelineRecords] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [rfidSuccessRate, setRfidSuccessRate] = useState<string>("100%");
  const [totalCheckedIn, setTotalCheckedIn] = useState<number>(0);
  const [totalCheckedOut, setTotalCheckedOut] = useState<number>(0);
  const [dynamicChartData, setDynamicChartData] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);

        const response = await axiosInstance.get("/api/v1/access/history", {
          params: { page: 1, limit: 50 },
        });

        if (!isMounted) return;

        const allLogs = response.data?.data || response.data?.history || (Array.isArray(response.data) ? response.data : []);
        const onlyVehicleLogs = allLogs.filter(
          (log: any) => log.vehicle_event_uid !== null && log.vehicle_event_uid !== undefined,
        );

        if (Array.isArray(onlyVehicleLogs)) {
          const formattedTimeline = [...onlyVehicleLogs]
            .sort((a: any, b: any) => parseTimestamp(getLogTimestamp(b)) - parseTimestamp(getLogTimestamp(a)))
            .slice(0, 15)
            .map((log: any) => {
              const timeStr = formatTimelineTime(getLogTimestamp(log));
              const identity = getVehicleSubject(log);
              const action = getLogAction(log);
              const location = log.gate_name || "Cổng kiểm soát";
              const isError = !log.plate?.number && !log.expected_plate_number;

              return {
                time: timeStr,
                text: `${identity} ${action} ${location}`,
                isError,
              };
            });

          setTimelineRecords(formattedTimeline);
        }

        let countInAirport = 0;
        let countCheckedOut = 0;
        let rfidValidCount = 0;

        const hourlyGroups: { [key: string]: number } = {
          "08h": 0, "09h": 0, "10h": 0, "11h": 0, "12h": 0,
          "13h": 0, "14h": 0, "15h": 0, "16h": 0, "17h": 0,
        };

        onlyVehicleLogs.forEach((log: any) => {
          if (log.status === "CHECKED_IN") {
            countInAirport++;
          } else if (log.status === "CHECKED_OUT") {
            countCheckedOut++;
          }

          if (log.plate?.number && log.plate.number !== "—") {
            rfidValidCount++;
          } else if (log.rfid_status === "SUCCESS" || log.rfid_card) {
            rfidValidCount++;
          }

          const logTimestamp = getLogTimestamp(log);
          if (logTimestamp) {
            const hour = formatTimelineTime(logTimestamp).substring(0, 2);
            if (hour) {
              const hourKey = `${hour}h`;
              hourlyGroups[hourKey] = (hourlyGroups[hourKey] || 0) + 1;
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
    const intervalId = window.setInterval(() => fetchDashboardData(true), DASHBOARD_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) fetchDashboardData(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <KpiCards
        isLoading={isLoading}
        totalVehicles={totalVehicles}
        vehiclesInAirport={vehiclesInAirport}
        vehiclesCheckedOut={vehiclesCheckedOut}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <CameraMonitoring />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <FleetStatus />
        </Grid>
      </Grid>

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
