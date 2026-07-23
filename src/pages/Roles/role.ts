export interface RoleItem {
  role_id: string;        // UUID: "d167b52b-f19f-4056-8e22-f8c9b6829aa0"
  role_code: string;      // "ADMIN", "GUARD", "MANAGER"
  role_name: string;      // "Admin", "Guard", "Manager"
  description?: string;
  is_system?: number | boolean;
  created_at?: string;
  updated_at?: string;
  permission_codes?: string[]; // Thêm ? vì API danh sách có thể không trả về trường này
}

// Interface dùng riêng khi gọi GET /api/v1/roles/{role_id}
export interface RoleDetailItem extends RoleItem {
  permission_codes: string[]; // Bắt buộc có mảng string khi lấy chi tiết
}

export interface RoleListResponse {
  roles: RoleItem[];
}

// Payload POST: Tạo mới Role
export interface CreateRolePayload {
  role_code: string;
  role_name: string;
  description?: string;
  permission_codes?: string[]; // Thêm trường này nếu API tạo Role cho phép gán quyền luôn
}

// Payload PATCH/PUT: Cập nhật thông tin Role
export interface UpdateRolePayload {
  role_name?: string;
  description?: string;
}

// Payload PUT: Cập nhật riêng danh sách quyền cho Role (/api/v1/roles/{role_id}/permissions)
export interface UpdateRolePermissionsPayload {
  permission_codes: string[];
}