'use client'

import { useState, useEffect } from 'react'
import { FaShoppingCart, FaHistory, FaWater, FaMoneyBillWave, FaUser } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

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
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    // Trong một ứng dụng thực tế, bạn sẽ gọi API để lấy dữ liệu
    // Ở đây, chúng ta sẽ sử dụng dữ liệu giả
    const fetchData = async () => {
      try {
        // Giả lập gọi API
        setTimeout(() => {
          setOrderSummary({
            totalOrders: 12,
            pendingOrders: 2,
            completedOrders: 10,
            totalSpent: 4500000
          })

          setRecentOrders([
            {
              id: 'ORD-001',
              date: '2025-05-15',
              total: 450000,
              status: 'Đã giao',
              items: [
                { name: 'Bình Lavie 20L', quantity: 5 }
              ]
            },
            {
              id: 'ORD-002',
              date: '2025-05-10',
              total: 350000,
              status: 'Đã giao',
              items: [
                { name: 'Bình Lavie 20L', quantity: 4 },
                { name: 'Vỏ bình', quantity: 1 }
              ]
            },
            {
              id: 'ORD-003',
              date: '2025-05-05',
              total: 600000,
              status: 'Đang giao',
              items: [
                { name: 'Bình Lavie 20L', quantity: 7 }
              ]
            }
          ])

          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching customer data:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      {order.items.map((item: any, index: number) => (
                        <div key={index}>
                          {item.name} x {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Đã giao' 
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/customer/order"
          className="flex items-center justify-between p-6 bg-primary-600 rounded-lg shadow hover:bg-primary-700 transition-colors"
        >
          <div>
            <h3 className="text-lg font-medium text-white">Đặt hàng mới</h3>
            <p className="text-primary-100">Đặt nước Lavie ngay hôm nay</p>
          </div>
          <FaShoppingCart className="h-8 w-8 text-white" />
        </Link>

        <Link 
          href="/customer/profile"
          className="flex items-center justify-between p-6 bg-gray-700 rounded-lg shadow hover:bg-gray-800 transition-colors"
        >
          <div>
            <h3 className="text-lg font-medium text-white">Thông tin tài khoản</h3>
            <p className="text-gray-300">Cập nhật thông tin cá nhân</p>
          </div>
          <FaUser className="h-8 w-8 text-white" />
        </Link>
      </div>
    </div>
  )
}
