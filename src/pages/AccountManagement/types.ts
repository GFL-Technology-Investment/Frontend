export interface UserItem {
  user_id: string;
  email: string;
  full_name: string;
  organization_id: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  total: number;
  users: UserItem[];
}