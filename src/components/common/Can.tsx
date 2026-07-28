// src/components/Common/Can.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface CanProps {
  perform: string;             // Tên permission cần kiểm tra, VD: "system.user.create"
  children: React.ReactNode;   // Phần UI muốn hiện nếu có quyền
  fallback?: React.ReactNode;  // UI hiển thị khi KHÔNG có quyền (mặc định là null)
}

export const Can: React.FC<CanProps> = ({ perform, children, fallback = null }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(perform)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};