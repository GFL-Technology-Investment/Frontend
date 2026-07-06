import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, Box, Typography, Avatar, Tooltip, IconButton, alpha, useTheme 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { UserItem, UserRole } from '../types';

interface UserTableProps {
  data: UserItem[];
  onEdit: (user: UserItem) => void;
  onDelete: (id: string) => void;
}

export default function UserTable({ data, onEdit, onDelete }: UserTableProps) {
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

  return (
    <Box>
      {/* 1. MÀN HÌNH DI ĐỘNG & TABLET (xs, sm): HIỂN THỊ DẠNG LIST CARD */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {data.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary', borderRadius: '12px' }}>
            Không tìm thấy dữ liệu nhân sự.
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
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 600 }}>
                    {user.fullName.split(' ').pop()?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.id} • Khởi tạo: {user.createdAt}</Typography>
                  </Box>
                </Box>
                {renderRoleChip(user.role)}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, my: 1.5, fontSize: '0.875rem' }}>
                <Typography variant="body2"><strong>Username:</strong> {user.username}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {user.email}</Typography>
                <Typography variant="body2"><strong>SĐT:</strong> {user.phoneNumber}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="body2"><strong>Trạng thái:</strong></Typography>
                  <Chip
                    label={user.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                    color={user.status === 'ACTIVE' ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1, borderTop: `1px dashed ${theme.palette.customBg?.border || '#e0e0e0'}` }}>
                <IconButton size="small" onClick={() => onEdit(user)} sx={{ color: 'info.main' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(user.id)} 
                  disabled={user.role === 'ADMIN'}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {/* 2. MÀN HÌNH MÁY TÍNH (md trở lên): HIỂN THỊ DẠNG TABLE CHUẨN */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          display: { xs: 'none', md: 'block' }, // Ẩn trên mobile
          bgcolor: theme.palette.customBg?.card || 'background.paper', 
          borderRadius: '12px', 
          boxShadow: 'none', 
          border: `1px solid ${theme.palette.customBg?.border || '#e0e0e0'}`, 
          overflow: 'hidden' 
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Mã NV</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Họ và tên nhân sự</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Tên đăng nhập</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Thông tin liên hệ</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Vai trò</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ pr: 3, fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Không tìm thấy tài khoản nhân sự phù hợp dữ liệu tra cứu.
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{user.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '0.875rem', fontWeight: 600 }}>
                        {user.fullName.split(' ').pop()?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{user.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">Khởi tạo: {user.createdAt}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>{user.username}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>{user.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.phoneNumber}</Typography>
                  </TableCell>
                  <TableCell>{renderRoleChip(user.role)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
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
                  <TableCell align="right" sx={{ pr: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="Sửa thông tin">
                        <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'info.main' } }} onClick={() => onEdit(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa tài khoản">
                        <IconButton 
                          size="small" 
                          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }} 
                          onClick={() => onDelete(user.id)} 
                          disabled={user.role === 'ADMIN'}
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
    </Box>
  );
}