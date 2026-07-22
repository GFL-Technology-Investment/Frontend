import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Typography, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { OrganizationItem } from './Organization';

interface OrganizationTableProps {
  organizations: OrganizationItem[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEditClick: (org: OrganizationItem) => void;
  onDeleteClick: (orgId: string) => void;
}

export default function OrganizationTable({
  organizations,
  total,
  page,
  limit,
  loading,
  onPageChange,
  onLimitChange,
  onEditClick,
  onDeleteClick,
}: OrganizationTableProps) {
  return (
    <Paper sx={{ borderRadius: '12px', boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã Tổ chức (ID)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên Tổ chức</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">Đang tải dữ liệu...</Typography>
                </TableCell>
              </TableRow>
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">Không tìm thấy tổ chức nào.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => {
                const isActive = Boolean(org.is_active);
                return (
                  <TableRow key={org.organization_id} hover>
                    <TableCell>
                      <Chip label={org.organization_id} color="primary" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{org.name}</TableCell>
                    <TableCell color="text.secondary">{org.created_at || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={isActive ? 'Hoạt động' : 'Tạm khóa'}
                        color={isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" size="small" onClick={() => onEditClick(org)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => onDeleteClick(org.organization_id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Phân trang */}
      <TablePagination
        component="div"
        count={total}
        page={page - 1} // MUI TablePagination dùng index bắt đầu từ 0
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Số bản ghi mỗi trang:"
      />
    </Paper>
  );
}