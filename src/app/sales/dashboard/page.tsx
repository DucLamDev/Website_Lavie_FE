'use client'
import { useEffect, useState } from 'react';
import { orderService } from '@/services/api/orderService';
import { inventoryService } from '@/services/api/inventoryService';
import { customerService } from '@/services/api/customerService';
import type { Order } from '@/services/api/orderService';
import type { Inventory } from '@/services/api/inventoryService';
import type { Customer } from '@/services/api/customerService';

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
        const [allOrders, inventorySummary, customers]: [Order[], any[], Customer[]] = await Promise.all([
          orderService.getOrders(),
          inventoryService.getInventorySummary(),
          customerService.getCustomers()
        ]);
        // Đơn trong ngày
        const today = new Date();
        const isToday = (dateStr: string) => {
          const d = new Date(dateStr);
          return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        };
        const orders = allOrders.filter(order => isToday(order.orderDate));
        const revenueToday = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
        // Tổng tồn kho
        const inventory = inventorySummary.reduce((sum, item) => sum + (item.inStock || 0), 0);
        setStats({
          ordersToday: orders.length,
          revenueToday,
          inventory,
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
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Tồn kho</div>
          <div className="text-2xl font-bold text-blue-600">{stats.inventory}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Khách hàng</div>
          <div className="text-2xl font-bold text-purple-600">{stats.customers}</div>
        </div>
      </div>
    </div>
  );
} 