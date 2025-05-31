'use client'
import { useEffect, useState } from 'react';
import { orderService } from '@/services/api/orderService';

interface Revenue { day: number; week: number; month: number; }

export default function SalesRevenuePage() {
  const [revenue, setRevenue] = useState<Revenue>({ day: 0, week: 0, month: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await orderService.getRevenue();
        setRevenue(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Doanh thu</h1>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Doanh thu hôm nay</div>
          <div className="text-2xl font-bold text-blue-600">{revenue.day.toLocaleString('vi-VN')} đ</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Doanh thu tuần này</div>
          <div className="text-2xl font-bold text-green-600">{revenue.week.toLocaleString('vi-VN')} đ</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Doanh thu tháng này</div>
          <div className="text-2xl font-bold text-purple-600">{revenue.month.toLocaleString('vi-VN')} đ</div>
        </div>
      </div>
    </div>
  );
} 