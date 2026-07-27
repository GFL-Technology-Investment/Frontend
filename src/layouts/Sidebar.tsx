import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  Toolbar,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useTheme,
  alpha,
} from "@mui/material";
import NoCrashIcon from "@mui/icons-material/NoCrash";
import HistoryIcon from "@mui/icons-material/History";
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import SettingsIcon from "@mui/icons-material/Settings";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import VideocamIcon from "@mui/icons-material/Videocam";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import GppGoodIcon from "@mui/icons-material/GppGood";
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from "../contexts/AuthContext";
import axiosInstance from "../configs/axios";
import { getDiscovery, type OidcProvider } from "../configs/oidcPkce";

interface SidebarProps {
  open: boolean;
  drawerWidth: number;
}

export default function Sidebar({ open, drawerWidth }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout } = useAuth();

  const [openSettings, setOpenSettings] = useState<boolean>(false);

  const handleToggleSettings = () => setOpenSettings(!openSettings);
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    // Đọc TRƯỚC khi xóa — localStorage.clear()/logout() sẽ xóa các key này.
    const ssoIdToken = localStorage.getItem("sso_id_token");
    const ssoProvider = localStorage.getItem(
      "sso_provider",
    ) as OidcProvider | null;
    const refreshToken = localStorage.getItem("refresh_token");

    // Thu hồi refresh token ở Backend TRƯỚC khi xóa local — nếu không, ai có
    // được refresh token cũ (vd máy dùng chung ở chốt gác) vẫn xin được
    // access token mới cho tới khi tự hết hạn, dù đã bấm "Đăng xuất".
    if (refreshToken) {
      try {
        const formData = new URLSearchParams();
        if (ssoProvider) formData.set("provider", ssoProvider);
        formData.set("refresh_token", refreshToken);

        // Dùng axiosInstance (không phải axios thô) để tự động gắn đúng
        // Authorization header theo cùng logic đang áp dụng cho mọi API khác.
        await axiosInstance.post("/api/v1/auth/logout", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
      } catch (err) {
        console.error("Thu hồi refresh token thất bại:", err);
        // Không chặn logout cục bộ dù thu hồi thất bại — ưu tiên không để
        // user bị kẹt lại trong app.
      }
    }

    localStorage.clear();
    logout();

    if (!ssoIdToken || !ssoProvider) {
      // Đăng nhập bằng dev-login — không có session IdP nào để đăng xuất,
      // giữ nguyên hành vi cũ.
      navigate("/login");
      return;
    }

    // Đăng nhập qua SSO — cần đăng xuất cả session IdP (RP-Initiated
    // Logout), nếu không, đăng nhập SSO lần sau sẽ tự động đăng nhập lại mà
    // không hỏi mật khẩu (session IdP vẫn còn sống trên trình duyệt).
    try {
      const discovery = await getDiscovery(ssoProvider);
      const params = new URLSearchParams({
        id_token_hint: ssoIdToken,
        post_logout_redirect_uri: `${window.location.origin}/login`,
      });

      if (discovery.end_session_endpoint) {
        window.location.href = `${discovery.end_session_endpoint}?${params.toString()}`;
        return;
      }
    } catch (err) {
      console.error("Không đăng xuất được khỏi Identity Provider:", err);
    }

    navigate("/login");
  };

  const menuItems = [
    {
      text: 'Dữ Liệu Tổng Quan',
      path: '/dashboard',
      icon: <DashboardIcon sx={{ fontSize: 20 }} />
    },
    {
      text: "Camera",
      path: "/camera-overview",
      icon: <VideocamIcon sx={{ fontSize: 20 }} />,
    },
    {
      text: "Lịch Sử Ra Vào",
      path: "/log-history",
      icon: <HistoryIcon sx={{ fontSize: 20 }} />,
    },
    {
      text: "Đăng Ký Xe",
      path: "/register-car",
      icon: <NoCrashIcon sx={{ fontSize: 20 }} />,
    },
    {
      text: "Đăng Ký Người",
      path: "/people-register",
      icon: <DirectionsRunIcon sx={{ fontSize: 20 }} />,
    },
  ];

  const settingSubItems = [
    {
      text: "Quản lý Tài khoản",
      path: "/system-management/users-management",
      icon: <ManageAccountsIcon fontSize="small" />,
    },
    {
      text: "Quản lý tổ chức",
      path: "/system-management/organizations-management",
      icon: <CorporateFareIcon fontSize="small" />,
    },
    {
      text: "Quản lý quyền",
      path: "/system-management/roles-management",
      icon: <AdminPanelSettingsIcon fontSize="small" />,
    },
    {
      text: "Phân quyền & Vai trò",
      path: "/system-management/permissions",
      icon: <GppGoodIcon fontSize="small" />,
    },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        transition: (t) =>
          t.transitions.create("width", {
            easing: t.transitions.easing.sharp,
            duration: t.transitions.duration.enteringScreen,
          }),
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: theme.palette.customBg.card,
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.customBg.border}`,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Toolbar />
      <Toolbar
        sx={{
          justifyContent: "flex-start",
          px: "20px !important",
          borderBottom: `1px solid ${theme.palette.customBg.border}`,
          minHeight: "48px !important",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          HỆ THỐNG ĐIỀU HÀNH
        </Typography>
      </Toolbar>

      <Box sx={{ overflow: "auto", mt: 1, flexGrow: 1 }}>
        <List sx={{ p: 0 }}>
          {/* MENU CHÍNH ĐƠN CẤP */}
          {menuItems.map((item) => {
            const isSelected = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isSelected}
                  sx={{
                    mx: 0.75,
                    borderRadius: "4px",
                    mb: 0.5,
                    py: 1,
                    px: 1.5,
                    color: theme.palette.text.primary,
                    borderLeft: isSelected
                      ? `3px solid ${theme.palette.primary.main}`
                      : "3px solid transparent", // Thanh màu chỉ định bên cạnh menu active
                    "&.Mui-selected": {
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.primary.main, 0.12)
                          : alpha(theme.palette.primary.main, 0.06),
                      color: theme.palette.primary.main,
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.primary.main, 0.18)
                            : alpha(theme.palette.primary.main, 0.1),
                      },
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main,
                      },
                    },
                    "&:hover": {
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? alpha("#ffffff", 0.04)
                          : alpha("#000000", 0.04),
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.text.primary,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: "32px",
                      color: isSelected
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "13.5px",
                          fontWeight: isSelected ? 600 : 500,
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* MENU CHA CÓ DROPDOWN */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleToggleSettings}
              sx={{
                mx: 0.75,
                borderRadius: "4px",
                mb: 0.5,
                py: 1,
                px: 1.5,
                color: theme.palette.text.primary,
                borderLeft: "3px solid transparent",
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha("#ffffff", 0.04)
                      : alpha("#000000", 0.04),
                },
              }}
            >
              <ListItemIcon
                sx={{ minWidth: "32px", color: theme.palette.text.secondary }}
              >
                <SettingsIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Quản Lý Hệ Thống"
                slotProps={{
                  primary: { sx: { fontSize: "13.5px", fontWeight: 500 } },
                }}
              />
              {openSettings ? (
                <ExpandLess sx={{ fontSize: 18, color: "text.secondary" }} />
              ) : (
                <ExpandMore sx={{ fontSize: 18, color: "text.secondary" }} />
              )}
            </ListItemButton>
          </ListItem>

          {/* KHỐI CON SỔ XUỐNG */}
          <Collapse in={openSettings} timeout="auto" unmountOnExit>
            <List
              component="div"
              disablePadding
              sx={{
                pl: 4,
                display: "flex",
                flexDirection: "column",
                gap: 0.25,
              }}
            >
              {settingSubItems.map((subItem) => {
                const isSubSelected = isActive(subItem.path);
                return (
                  <ListItem key={subItem.text} disablePadding>
                    <ListItemButton
                      onClick={() => navigate(subItem.path)}
                      selected={isSubSelected}
                      sx={{
                        mx: 0.75,
                        borderRadius: "4px",
                        height: "36px",
                        color: theme.palette.text.primary,
                        borderLeft: isSubSelected
                          ? `3px solid ${theme.palette.primary.main}`
                          : "3px solid transparent",
                        "&.Mui-selected": {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? alpha(theme.palette.primary.main, 0.1)
                              : alpha(theme.palette.primary.main, 0.04),
                          color: theme.palette.primary.main,
                          "& .MuiListItemIcon-root": {
                            color: theme.palette.primary.main,
                          },
                          "&:hover": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? alpha(theme.palette.primary.main, 0.16)
                                : alpha(theme.palette.primary.main, 0.08),
                          },
                        },
                        "&:hover": {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? alpha("#ffffff", 0.03)
                              : alpha("#000000", 0.03),
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: "28px",
                          color: isSubSelected
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                        }}
                      >
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={subItem.text}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: "12.5px",
                              fontWeight: isSubSelected ? 600 : 500,
                            },
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </List>
      </Box>

      {/* KHỐI ĐĂNG XUẤT PHẲNG ĐỒNG BỘ Ở ĐÁY */}
      <Box
        sx={{
          p: 0.75,
          borderTop: `1px solid ${theme.palette.customBg.border}`,
        }}
      >
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                mx: 0,
                borderRadius: "4px",
                py: 1,
                color: theme.palette.error.main,
                borderLeft: "3px solid transparent",
                "&:hover": {
                  bgcolor: alpha(theme.palette.error.main, 0.06),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: "32px",
                  pl: 0.5,
                  color: theme.palette.error.main,
                }}
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Đăng xuất"
                slotProps={{
                  primary: { sx: { fontSize: "13.5px", fontWeight: 600 } },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
