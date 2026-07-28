import { createContext, useContext, useState, type ReactNode } from "react";

export interface UserInfo {
  userId?: string;
  username: string;
  email?: string;
  fullName?: string;
  role: string;
  roles?: string[];
  organizationId: string;
  permissions: string[]; // Thêm mảng permissions
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: UserInfo | null;
  permissions: string[];
  login: (token: string, userInfo: any) => void;
  logout: () => void;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token") || localStorage.getItem("token")
  );

  const [user, setUser] = useState<UserInfo | null>(() => {
    const savedUser = localStorage.getItem("user_info");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Mảng permissions phục vụ phân quyền nhanh
  const permissions = user?.permissions || [];

  const login = (jwtToken: string, responseData: any) => {
    console.log(">>> [DEBUG LOGIN] Payload từ Backend:", responseData);

    // 1. Lấy đúng object user (xử lý trường hợp response nằm trong responseData.user)
    const rawUser = responseData?.user || responseData || {};

    // 2. Map dữ liệu chuẩn vào UserInfo
    const normalizedUser: UserInfo = {
      userId: rawUser.user_id || rawUser.userId || "",
      username: rawUser.username || rawUser.email || "",
      email: rawUser.email || "",
      fullName: rawUser.full_name || rawUser.fullName || rawUser.email || "",
      role: rawUser.role || (rawUser.roles && rawUser.roles.length > 0 ? rawUser.roles[0] : "GUARD"),
      roles: rawUser.roles || [],
      organizationId: rawUser.organization_id || rawUser.organizationId || rawUser.org_id || "",
      permissions: rawUser.permissions || [], // Lúc này đã bóc tách đúng mảng permissions từ rawUser
    };

    console.log(">>> [DEBUG LOGIN] UserInfo sau khi normalize:", normalizedUser);

    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user_info", JSON.stringify(normalizedUser));
    setToken(jwtToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("camera_token");
    localStorage.removeItem("dev-camera-token");
    localStorage.removeItem("theme_mode");
    localStorage.removeItem("user_info");
    localStorage.removeItem("sso_id_token");

    setToken(null);
    setUser(null);
  };

  // Hàm helper 1: Kiểm tra 1 quyền cụ thể
  const hasPermission = (requiredPermission: string): boolean => {
    if (!permissions || permissions.length === 0) return false;

    // 1. Trường hợp Admin có dấu wildcard '*' (có tất cả quyền)
    if (permissions.includes('*')) return true;

    // 2. Trường hợp khớp chính xác quyền (ví dụ: 'system.user.create')
    if (permissions.includes(requiredPermission)) return true;

    // 3. (Mở rộng) Trường hợp wildcard theo nhóm phân hệ (ví dụ: 'system.user.*' hoặc 'system.*')
    const hasWildcardGroup = permissions.some((perm) => {
      if (perm.endsWith('.*')) {
        const prefix = perm.slice(0, -2); // Lấy phần đầu, ví dụ 'system.user'
        return requiredPermission.startsWith(prefix);
      }
      return false;
    });

    return hasWildcardGroup;
  };

  // Hàm helper 2: Kiểm tra nếu user có ÍT NHẤT 1 trong danh sách quyền
  const hasAnyPermission = (codes: string[]): boolean => {
    return codes.some((code) => permissions.includes(code));
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        permissions,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}