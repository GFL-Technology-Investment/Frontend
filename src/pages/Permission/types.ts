export type UserRole = 'ADMIN' | 'MANAGER' | 'SECURITY_GUARD';

export interface UserPermission {
  id: string;
  username: string;
  fullName: string;
  gateCode: string; // Mã bốt/cổng đang trực
  role: UserRole;
  canViewCamera: boolean;
  canApproveVehicle: boolean;
  canExportReport: boolean;
  canManageSystem: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}