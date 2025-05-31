'use client'
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Thông tin tài khoản</h1>
      <div className="space-y-4">
        <div>
          <span className="font-medium text-gray-700">Tên khách hàng:</span>
          <span className="ml-2 text-gray-900">{user?.name}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Tên đăng nhập:</span>
          <span className="ml-2 text-gray-900">{user?.username}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Vai trò:</span>
          <span className="ml-2 text-gray-900">Khách hàng</span>
        </div>
      </div>
      {/* Nếu muốn thêm chức năng đổi mật khẩu, có thể bổ sung form ở đây */}
    </div>
  );
} 