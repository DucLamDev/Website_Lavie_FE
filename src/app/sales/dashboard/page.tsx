'use client'
import { useEffect, useState } from 'react';
import { orderService } from '@/services/api/orderService';
import { inventoryService } from '@/services/api/inventoryService';
import { customerService } from '@/services/api/customerService';
import type { Order } from '@/services/api/orderService';
import type { Customer } from '@/services/api/customerService';
import { reportService } from '@/services/api/reportService';
import { getUsers, User } from '@/services/api/userService';

// Định nghĩa type cho item tồn kho lấy từ reportService
interface InventoryItem {
  productId: string;
  productName: string;
  inStock: number;
}

export default function SalesDashboardPage() {
  const [stats, setStats] = useState<{
    ordersToday: number;
    revenueToday: number;
    inventory: number;
    customers: number;
    isLoading: boolean;
  }>({
    ordersToday: 0,
    revenueToday: 0,
    inventory: 0,
    customers: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Đơn và doanh thu hôm nay
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const daily = await reportService.getDailyRevenue(todayStr);
        // Tồn kho
        const inventoryData = await reportService.getInventoryReport();
        const allProducts = [
          ...(inventoryData.lowStockProducts || []),
          ...(inventoryData.outOfStockProducts || []),
          ...(inventoryData.mostStockedProducts || [])
        ];
        // Loại trùng productId
        const unique = Object.values(
          allProducts.reduce((acc: Record<string, InventoryItem>, item: any) => {
            acc[item.productId] = {
              productId: item.productId,
              productName: item.productName,
              inStock: item.inStock
            };
            return acc;
          }, {})
        ) as InventoryItem[];
        const totalInventory = unique.reduce((sum, item) => sum + (item.inStock || 0), 0);
        // Khách hàng
        const users: User[] = await getUsers();
        const customers = users.filter(u => u.role === 'customer');
        setStats({
          ordersToday: daily.totalOrders || 0,
          revenueToday: daily.totalRevenue || 0,
          inventory: totalInventory,
          customers: customers.length,
          isLoading: false
        });
      } catch {
        setStats(s => ({ ...s, isLoading: false }));
      }
    };
    fetchData();
  }, []);

  if (stats.isLoading) return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Sales</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Đơn trong ngày</div>
          <div className="text-2xl font-bold text-primary-600">{stats.ordersToday}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Doanh thu trong ngày</div>
          <div className="text-2xl font-bold text-green-600">{stats.revenueToday.toLocaleString('vi-VN')} đ</div>
        </div>
        {/* <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Tồn kho</div>
          <div className="text-2xl font-bold text-blue-600">{stats.inventory}</div>
        </div> */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Khách hàng</div>
          <div className="text-2xl font-bold text-purple-600">{stats.customers}</div>
        </div>
      </div>
    </div>
  );
} 