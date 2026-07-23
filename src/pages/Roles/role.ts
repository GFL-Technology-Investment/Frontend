export interface RoleItem {
  role_id: string;        // UUID: "d167b52b-f19f-4056-8e22-f8c9b6829aa0"
  role_code: string;      // "ADMIN", "GUARD", "MANAGER"
  role_name: string;      // "Admin", "Guard", "Manager"
  description?: string;
  is_system?: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoleListResponse {
  roles: RoleItem[];
}

// Payload POST:
export interface CreateRolePayload {
  role_code: string;
  role_name: string;
  description?: string;
}

// Payload PATCH:
export interface UpdateRolePayload {
  role_name?: string;
  description?: string;
}