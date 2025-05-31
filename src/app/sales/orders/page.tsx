'use client'
import { useEffect, useState } from 'react';
import { orderService } from '@/services/api/orderService';

interface Order { _id: string; customerName: string; totalAmount: number; status: string; }

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allOrders = await orderService.getOrders();
        // Lọc đơn hàng trong ngày (theo orderDate là hôm nay)
        const today = new Date();
        const isToday = (dateStr: string) => {
          const d = new Date(dateStr);
          return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        };
        const data = allOrders.filter(order => isToday(order.orderDate));
        setOrders(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Đơn hàng trong ngày</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map(order => (
            <tr key={order._id}>
              <td className="px-6 py-4 whitespace-nowrap text-primary-600">{order._id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.customerName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.totalAmount.toLocaleString('vi-VN')} đ</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 