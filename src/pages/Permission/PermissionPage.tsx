import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Checkbox, FormControlLabel,
  Alert, CircularProgress, Divider, Stack, Chip, Card, CardContent
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';

import axiosInstance from '../../configs/axios';
import type { RoleItem } from '../Roles/role';
import type { PermissionItem } from './permission';

export default function RolePermissionPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  
  // Lưu danh sách permission_code (hoặc permission_id) được tích chọn
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // 1. Tải danh sách Roles & Permissions ban đầu
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const [rolesRes, permsRes] = await Promise.all([
          axiosInstance.get('/api/v1/roles'),
          axiosInstance.get('/api/v1/permissions')
        ]);

        const roleList: RoleItem[] = rolesRes.data.roles || [];
        const permList: PermissionItem[] = permsRes.data.permissions || [];

        setRoles(roleList);
        setPermissions(permList);

        if (roleList.length > 0) {
          setSelectedRoleId(roleList[0].role_id);
        }
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu phân quyền:', err);
        setErrorMsg(err.response?.data?.detail || 'Không thể tải danh sách vai trò hoặc quyền.');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // 2. Lấy chi tiết Role (chứa permission_codes) khi chuyển chọn Role khác
  useEffect(() => {
    if (!selectedRoleId) return;

    const fetchRoleDetail = async () => {
      setErrorMsg('');
      setSuccessMsg('');
      try {
        // Thay đổi sang API /api/v1/roles/{role_id}
        const response = await axiosInstance.get(`/api/v1/roles/${selectedRoleId}`);
        const assignedCodes: string[] = response.data.permission_codes || [];
        
        // Lưu trữ dưới dạng Set các permission_code
        setSelectedPermissionCodes(new Set(assignedCodes));
      } catch (err: any) {
        console.error('Lỗi lấy quyền của vai trò:', err);
        setErrorMsg('Không thể tải danh sách quyền của vai trò này');
      }
    };

    fetchRoleDetail();
  }, [selectedRoleId]);

  // Gom nhóm danh sách Permissions theo `module`
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    permissions.forEach((perm) => {
      const moduleName = perm.module || 'HỆ THỐNG CHUNG';
      if (!groups[moduleName]) groups[moduleName] = [];
      groups[moduleName].push(perm);
    });
    return groups;
  }, [permissions]);

  // Xử lý Check/Uncheck 1 quyền đơn lẻ theo permission_code (hoặc permission_id)
  const handleTogglePermission = (permCode: string) => {
    setSelectedPermissionCodes((prev) => {
      const next = new Set(prev);
      if (next.has(permCode)) {
        next.delete(permCode);
      } else {
        next.add(permCode);
      }
      return next;
    });
  };

  // Xử lý Chọn tất cả / Bỏ chọn tất cả của 1 Module
  const handleToggleModule = (modulePerms: PermissionItem[]) => {
    const moduleCodes = modulePerms.map((p) => p.permission_code || p.permission_id);
    const isAllChecked = moduleCodes.every((code) => selectedPermissionCodes.has(code));

    setSelectedPermissionCodes((prev) => {
      const next = new Set(prev);
      if (isAllChecked) {
        moduleCodes.forEach((code) => next.delete(code));
      } else {
        moduleCodes.forEach((code) => next.add(code));
      }
      return next;
    });
  };

  // 3. LƯU THAY ĐỔI
  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Tùy theo định dạng Backend nhận (permission_codes hoặc permission_ids)
      const payloadArray = Array.from(selectedPermissionCodes);
      
      await axiosInstance.put(`/api/v1/roles/${selectedRoleId}/permissions`, {
        permission_codes: payloadArray, // hoặc permission_ids tùy thuộc vào API Save của bạn
      });
      setSuccessMsg('Cập nhật phân quyền thành công!');
    } catch (err: any) {
      console.error('Lỗi lưu phân quyền:', err);
      setErrorMsg(err.response?.data?.detail || 'Lưu phân quyền thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const currentRole = roles.find((r) => r.role_id === selectedRoleId);

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            MA TRẬN PHÂN QUYỀN
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Thiết lập danh sách các quyền truy cập tính năng cho từng vai trò
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSavePermissions}
          disabled={saving || loading || !selectedRoleId}
          sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình quyền'}
        </Button>
      </Box>

      {/* Thông báo Alert */}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* CỘT BÊN TRÁI: DANH SÁCH VAI TRÒ */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                Danh sách Vai trò
              </Typography>
              <Stack spacing={1}>
                {roles.map((role) => {
                  const isSelected = role.role_id === selectedRoleId;
                  return (
                    <Card
                      key={role.role_id}
                      onClick={() => setSelectedRoleId(role.role_id)}
                      elevation={0}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'action.hover' : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? 'primary.main' : 'text.primary' }}
                          >
                            {role.role_name}
                          </Typography>
                          <Chip
                            label={role.role_code}
                            size="small"
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </Box>
                        {role.description && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                            {role.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          {/* CỘT BÊN PHẢI: BẢNG CHECKBOX QUYỀN HẠN */}
          <Grid size={{ xs: 12, md: 8.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {currentRole && (
                <Box sx={{ pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Phân quyền cho: <span style={{ color: '#1976d2' }}>{currentRole.role_name}</span>
                  </Typography>
                </Box>
              )}

              {Object.keys(groupedPermissions).length === 0 ? (
                <Typography sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
                  Chưa có dữ liệu danh sách quyền hệ thống.
                </Typography>
              ) : (
                <Stack spacing={3}>
                  {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => {
                    // Lấy mã key để so sánh (ưu tiên permission_code)
                    const moduleKeys = modulePerms.map((p) => p.permission_code || p.permission_id);
                    const checkedCount = moduleKeys.filter((key) => selectedPermissionCodes.has(key)).length;
                    const isAllChecked = checkedCount === modulePerms.length && modulePerms.length > 0;
                    const isSomeChecked = checkedCount > 0 && checkedCount < modulePerms.length;

                    return (
                      <Box key={moduleName} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                        {/* Header Module */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isAllChecked}
                                indeterminate={isSomeChecked}
                                onChange={() => handleToggleModule(modulePerms)}
                                color="primary"
                                checkedIcon={<CheckBoxIcon />}
                                indeterminateIcon={<IndeterminateCheckBoxIcon color="primary" />}
                                icon={<CheckBoxOutlineBlankIcon />}
                              />
                            }
                            label={
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {moduleName}
                              </Typography>
                            }
                          />
                          <Chip
                            label={`${checkedCount}/${modulePerms.length} quyền`}
                            size="small"
                            variant="outlined"
                            sx={{ color: 'text.secondary', borderColor: 'divider' }}
                          />
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Danh sách Checkbox Quyền */}
                        <Grid container spacing={1.5}>
                          {modulePerms.map((perm) => {
                            // Key dùng để xác định xem quyền này đã được tick chưa
                            const targetKey = perm.permission_code || perm.permission_id;
                            const isChecked = selectedPermissionCodes.has(targetKey);

                            return (
                              <Grid size={{ xs: 12, sm: 6 }} key={perm.permission_id || targetKey}>
                                <Box
                                  onClick={() => handleTogglePermission(targetKey)}
                                  sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    border: '1px solid',
                                    borderColor: isChecked ? 'primary.main' : 'divider',
                                    bgcolor: isChecked ? 'action.hover' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    transition: 'all 0.15s',
                                  }}
                                >
                                  <Checkbox
                                    size="small"
                                    checked={isChecked}
                                    color="primary"
                                    sx={{ p: 0.5, mt: 0.2 }}
                                  />
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {perm.permission_name}
                                    </Typography>

                                    <Typography variant="caption" sx={{ color: 'primary.main', fontFamily: 'monospace', display: 'block' }}>
                                      {perm.permission_code}
                                    </Typography>

                                    {perm.description && (
                                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                        {perm.description}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}