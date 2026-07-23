
export interface PermissionItem {
  permission_id: string;
  permission_code: string; // VD: USER_CREATE, USER_EDIT
  permission_name: string; // VD: Tạo mới người dùng
  module: string;          // VD: QUẢN LÝ NGƯỜI DÙNG
  description?: string;
}

export interface RolePermissionMatrix {
  role_id: string;
  role_code: string;
  role_name: string;
  assigned_permission_ids: string[]; // Danh sách ID các quyền đã được cấp
}