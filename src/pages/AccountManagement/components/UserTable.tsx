import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Box, Avatar, Typography, Tooltip, IconButton, useTheme, Stack, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShieldIcon from '@mui/icons-material/Shield';
import type { UserItem } from '../types';

interface UserTableProps {
  users: UserItem[];
  loading: boolean;
  onEditClick: (user: UserItem) => void;
  onDeleteClick: (user_id: string) => void;
}

export default function UserTable({ users, loading, onEditClick, onDeleteClick }: UserTableProps) {
  const theme = useTheme();

  const getRoleChipColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'GUARD':
        return 'success'; 
      case 'MANAGER':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        bgcolor: theme.palette.customBg?.card || 'background.paper',
        borderRadius: '12px',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.customBg?.border || theme.palette.divider}`,
        overflow: 'hidden'
      }}
    >
      <Table sx={{ minWidth: 800 }}>
        <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f1f3f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Họ và Tên / ID</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Mã tổ chức</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Vai trò</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Quyền hạn</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Trạng thái</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                <CircularProgress size={36} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đang tải danh sách tài khoản...
                </Typography>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                <Typography variant="body2" color="text.secondary">
                  Không tìm thấy tài khoản nào trong hệ thống.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.user_id} hover>
                {/* Họ tên & ID */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: theme.palette.primary.main, fontSize: '13px', fontWeight: 'bold' }}>
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.full_name || 'Chưa cập nhật'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {user.user_id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Email */}
                <TableCell sx={{ fontWeight: 500 }}>{user.email}</TableCell>

                {/* Organization ID */}
                <TableCell>
                  <Chip label={user.organization_id} size="small" variant="outlined" />
                </TableCell>

                {/* Roles */}
                <TableCell>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    {user.roles?.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        color={getRoleChipColor(role)}
                        size="small"
                        icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{ fontWeight: 'bold' }}
                      />
                    ))}
                  </Stack>
                </TableCell>

                {/* Permissions (Hover để xem full) */}
                <TableCell>
                  <Tooltip
                    arrow
                    title={
                      <Box sx={{ p: 0.5, maxHeight: 160, overflowY: 'auto' }}>
                        {user.permissions?.map((perm) => (
                          <Typography key={perm} variant="caption" sx={{ display: 'block' }}>
                            • {perm}
                          </Typography>
                        ))}
                      </Box>
                    }
                  >
                    <Chip
                      label={`${user.permissions?.length || 0} quyền được cấp`}
                      size="small"
                      variant="outlined"
                      color="info"
                      sx={{ cursor: 'pointer', fontWeight: 500 }}
                    />
                  </Tooltip>
                </TableCell>

                {/* Trạng thái */}
                <TableCell align="center">
                  <Chip
                    label={user.is_active ? 'Hoạt động' : 'Tạm khóa'}
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>

                {/* Hành động */}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="Chỉnh sửa thông tin">
                      <IconButton size="small" color="info" onClick={() => onEditClick(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa tài khoản">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteClick(user.user_id)}
                        disabled={user.roles.includes('ADMIN')}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}