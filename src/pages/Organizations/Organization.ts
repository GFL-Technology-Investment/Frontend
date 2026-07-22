// 1. Interface đại diện cho 1 item Tổ chức nhận về từ API
export interface OrganizationItem {
  organization_id: string; // VD: "org-001"
  name: string;            // VD: "Sân Nội Bài / Org test"
  is_active: boolean | number;
  created_at?: string;
}

// 2. Response trả về từ API danh sách
export interface OrganizationListResponse {
  total: number;
  organizations: OrganizationItem[];
}

// 3. Payload gửi lên API POST (Thêm mới)
export interface CreateOrganizationPayload {
  organization_id: string;
  name: string;
}

// 4. Payload gửi lên API PUT (Chỉnh sửa)
export interface UpdateOrganizationPayload {
  name: string;
  is_active: boolean;
}

// 5. Form Data dùng chung cho Form State trong Component Dialog
export interface OrganizationFormData {
  organization_id: string;
  name: string;
  is_active: boolean;
}