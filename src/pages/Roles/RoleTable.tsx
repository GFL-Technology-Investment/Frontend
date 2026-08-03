import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Typography, TablePagination, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import type { RoleItem } from './role';
import { Can } from '../../components/common/Can';
interface RoleTableProps {
  roles: RoleItem[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEditClick: (role: RoleItem) => void;
  onDeleteClick: (roleId: string) => void;
}

export default function RoleTable({
  roles,
  total,
  page,
  limit,
  loading,
  onPageChange,
  onLimitChange,
  onEditClick,
  onDeleteClick,
}: RoleTableProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Mã Vai Trò (Role Code)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Tên Vai Trò</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Loại Quyền</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Đang tải dữ liệu...</Typography>
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Không tìm thấy vai trò nào.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                const isSystemRole = Boolean(role.is_system);
                return (
                  <TableRow key={role.role_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Chip
                        label={role.role_code}
                        color="primary"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{role.role_name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{role.description || '-'}</TableCell>
                    <TableCell>
                      {isSystemRole ? (
                        <Chip
                          icon={<LockIcon fontSize="small" />}
                          label="Hệ thống"
                          size="small"
                          sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 500 }}
                        />
                      ) : (
                        <Chip
                          label="Tùy chỉnh"
                          color="info"
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Can perform="system.role.update">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton color="primary" size="small" onClick={() => onEditClick(role)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Can>
                      {isSystemRole ? (
                        <Tooltip title="Không thể xóa vai trò hệ thống">
                          <span>
                            <IconButton size="small" disabled sx={{ color: 'action.disabled' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Can perform="system.role.delete">
                          <Tooltip title="Xóa vai trò">
                            <IconButton color="error" size="small" onClick={() => onDeleteClick(role.role_id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Can>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total || roles.length}
        page={page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Số bản ghi mỗi trang:"
        sx={{
          color: 'text.secondary',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      />
    </Paper>
  );
}