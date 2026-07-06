import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Switch, Chip, Box, Typography, Avatar, alpha, useTheme
} from '@mui/material';
import type { UserPermission, UserRole } from '../types';

interface PermissionTableProps {
  data: UserPermission[];
  onPermissionChange: (userId: string, field: keyof UserPermission) => void;
}

export default function PermissionTable({ data, onPermissionChange }: PermissionTableProps) {
  const theme = useTheme();

  const renderRoleChip = (role: UserRole) => {
    const config = {
      ADMIN: { label: 'Quản trị viên', color: theme.palette.error.main },
      MANAGER: { label: 'Điều hành bến', color: theme.palette.warning.main },
      SECURITY_GUARD: { label: 'Bảo vệ bốt', color: theme.palette.primary.main },
    };
    const target = config[role] || config.SECURITY_GUARD;
    return (
      <Chip
        label={target.label}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          color: target.color,
          bgcolor: alpha(target.color, 0.08),
          border: `1px solid ${alpha(target.color, 0.2)}`
        }}
      />
    );
  };

  const renderSwitchRow = (user: UserPermission, label: string, field: keyof UserPermission) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Switch
        size="small"
        checked={Boolean(user[field])}
        onChange={() => onPermissionChange(user.id, field)}
        disabled={user.role === 'ADMIN'}
      />
    </Box>
  );

  return (
    <Box>
      {/* MÀN HÌNH NHỎ (xs, sm): BIẾN ĐỔI THÀNH DANH SÁCH CARD RESPONSIVE */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
        {data.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary', borderRadius: '12px' }}>
            Không tìm thấy nhân sự phù hợp bộ lọc.
          </Paper>
        ) : (
          data.map((user) => (
            <Paper
              key={user.id}
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: theme.palette.customBg?.card || 'background.paper',
                border: `1px solid ${theme.palette.customBg?.border || '#e0e0e0'}`,
                boxShadow: 'none'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 600 }}>
                    {user.fullName.split(' ').pop()?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.id} • @{user.username}</Typography>
                  </Box>
                </Box>
                {renderRoleChip(user.role)}
              </Box>

              <Box sx={{ mb: 1.5, px: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    fontWeight: 700,
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {`Vị trí bốt: ${user.gateCode === 'ALL' ? 'Tất cả các làn' : user.gateCode}`}
                </Typography>

                {renderSwitchRow(user, 'Xem Camera OCR', 'canViewCamera')}
                {renderSwitchRow(user, 'Phê duyệt Xe Vào/Ra', 'canApproveVehicle')}
                {renderSwitchRow(user, 'Xuất báo cáo dữ liệu', 'canExportReport')}
                {renderSwitchRow(user, 'Quản trị hệ thống', 'canManageSystem')}
              </Box>

              <Box sx={{ pt: 1, borderTop: `1px dashed ${theme.palette.customBg?.border || '#e0e0e0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Trạng thái công việc:</Typography>
                <Chip
                  label={user.status === 'ACTIVE' ? 'Đang trực' : 'Tạm khóa'}
                  color={user.status === 'ACTIVE' ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {/* MÀN HÌNH LỚN (md trở lên): GIỮ BẢNG ENTERPRISE TRÀN VIỀN TỐI ƯU CỘT */}
      <TableContainer
        component={Paper}
        sx={{
          display: { xs: 'none', md: 'block' },
          bgcolor: theme.palette.customBg?.card || 'background.paper',
          borderRadius: '12px',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.customBg?.border || '#e0e0e0'}`,
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Nhân sự bốt trực</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Vai trò</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Bốt phân công</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Xem Camera OCR</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Phê duyệt Xe</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Xuất báo cáo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Quản trị hệ thống</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Không tìm thấy nhân sự phù hợp dữ liệu tra cứu.
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '0.875rem', fontWeight: 600 }}>
                        {user.fullName.split(' ').pop()?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{user.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.id} • @{user.username}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>{renderRoleChip(user.role)}</TableCell>

                  <TableCell sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
                    {user.gateCode === 'ALL' ? 'Tất cả các làn' : `Làn trực: ${user.gateCode}`}
                  </TableCell>

                  <TableCell align="center">
                    <Switch
                      checked={user.canViewCamera}
                      onChange={() => onPermissionChange(user.id, 'canViewCamera')}
                      disabled={user.role === 'ADMIN'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={user.canApproveVehicle}
                      onChange={() => onPermissionChange(user.id, 'canApproveVehicle')}
                      disabled={user.role === 'ADMIN'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={user.canExportReport}
                      onChange={() => onPermissionChange(user.id, 'canExportReport')}
                      disabled={user.role === 'ADMIN'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={user.canManageSystem}
                      onChange={() => onPermissionChange(user.id, 'canManageSystem')}
                      disabled={user.role === 'ADMIN'}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={user.status === 'ACTIVE' ? 'Đang trực' : 'Tạm khóa'}
                      color={user.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                      variant={user.status === 'ACTIVE' ? 'filled' : 'outlined'}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        ...(user.status === 'ACTIVE' && { bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` })
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}