import { Routes, Route, Navigate } from "react-router-dom";
import SecurityLayout from "../layouts/SecurityLayout";
import VehicleInPage from "../pages/VehicleIn";
import HistoryLogPage from "../pages/HistoryLog";
import VehicleRegistrationPage from "../pages/VehicleRegistration";
import UserRegistrationPage from "../pages/PeopleRegister";
import CameraOverviewPage from "../pages/CameraOverView";
import NotFoundPage from "../pages/NotFound/NotFound";
import PermissionPage from "../pages/Permission/Permission";
import UserManagementPage from "../pages/AccountManagement/UserManagementPage";
import VehicleOutPage from "../pages/VehicleOut";
import LoginPage from "../pages/LoginPage/LoginPage";
import SsoCallbackPage from "../pages/LoginPage/SsoCallbackPage";
import ProtectedRoute from "../components/ProtectRoute";
import OrganizationManagementPage from "../pages/Organizations/OrganizationManagementPage";
import RoleManagementPage from "../pages/Roles/RoleManagementPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Tuyến đường công khai: Không cần đăng nhập, nằm ngoài SecurityLayout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/sso-callback" element={<SsoCallbackPage />} />

      {/* 2. Tuyến đường bảo mật: Bọc ProtectedRoute ở ngoài cùng để bảo vệ tất cả các trang con */}
      <Route
        element={
          <ProtectedRoute>
            <SecurityLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/camera-overview" replace />} />
        <Route path="/camera-overview" element={<CameraOverviewPage />} />
        <Route path="/log-history" element={<HistoryLogPage />} />
        <Route path="/vehicle-in" element={<VehicleInPage />} />
        <Route path="/vehicle-out" element={<VehicleOutPage />} />
        <Route path="/register-car" element={<VehicleRegistrationPage />} />
        <Route path="/people-register" element={<UserRegistrationPage />} />
        <Route path="/system-management/permissions" element={<PermissionPage />} />
        <Route path="/system-management/users-management" element={<UserManagementPage />} />
        <Route path="/system-management/organizations-management" element={<OrganizationManagementPage />} />
        <Route path="/system-management/roles-management" element={<RoleManagementPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
