'use client'

import { useState, useEffect } from 'react'
import { FaShoppingCart, FaHistory, FaWater, FaMoneyBillWave, FaUser } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { orderService, Order } from '@/services/api/orderService'

interface OrderSummary {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalSpent: number
}

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        // Lấy tất cả đơn hàng của user hiện tại
        const allOrders = await orderService.getOrders();
        // Lọc đơn hàng của user hiện tại
        const customerOrders = allOrders.filter((order) => order.customerId === user.id);
        // Tính toán thống kê
        const totalOrders = customerOrders.length;
        const pendingOrders = customerOrders.filter((o) => o.status === 'pending').length;
        const completedOrders = customerOrders.filter((o) => o.status === 'completed').length;
        // Tổng chi tiêu: cộng tất cả paidAmount (nếu có), nếu không thì cộng totalAmount của đơn đã thanh toán hoặc tất cả đơn
        const totalSpent = customerOrders.reduce((sum, o) => sum + (o.paidAmount || (o.status === 'completed' ? o.totalAmount : 0)), 0);
        setOrderSummary({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent
        });
        // Lấy 5 đơn hàng gần nhất
        const sortedOrders = customerOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setRecentOrders(sortedOrders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Xin chào, {user?.name}</h1>
        <p className="mt-1 text-gray-600">Chào mừng bạn quay trở lại với hệ thống đặt nước Lavie</p>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-blue-100">
              <FaShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
              <p className="text-2xl font-semibold text-gray-900">{orderSummary.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-yellow-100">
              <FaHistory className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Đơn đang xử lý</p>
              <p className="text-2xl font-semibold text-gray-900">{orderSummary.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-green-100">
              <FaWater className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Đơn đã hoàn thành</p>
              <p className="text-2xl font-semibold text-gray-900">{orderSummary.completedOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-purple-100">
              <FaMoneyBillWave className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Tổng chi tiêu</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(orderSummary.totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Đơn hàng gần đây */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h2>
            <Link 
              href="/customer/order-history" 
              className="text-sm font-medium text-primary-600 hover:text-primary-800"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    {order._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hành động nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Link href="/customer/order" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-between px-8 py-6 shadow">
          <div>
            <div className="text-lg font-semibold mb-1">Đặt hàng mới</div>
            <div className="text-sm">Đặt nước Lavie ngay hôm nay</div>
          </div>
          <span className="text-3xl ml-4"><i className="fas fa-shopping-cart"></i></span>
        </Link>
        <Link href="/customer/profile" className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg flex items-center justify-between px-8 py-6 shadow">
          <div>
            <div className="text-lg font-semibold mb-1">Thông tin tài khoản</div>
            <div className="text-sm">Cập nhật thông tin cá nhân</div>
          </div>
          <span className="text-3xl ml-4"><i className="fas fa-user"></i></span>
        </Link>
      </div>
    </div>
  )
}
