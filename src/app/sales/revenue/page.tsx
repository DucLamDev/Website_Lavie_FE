'use client'
import { useEffect, useState } from 'react';
import { reportService } from '@/services/api/reportService';

interface Revenue { day: number; week: number; month: number; }

export default function SalesRevenuePage() {
  const [revenue, setRevenue] = useState<Revenue>({ day: 0, week: 0, month: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Lấy doanh thu hôm nay
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const daily = await reportService.getDailyRevenue(todayStr);
        // Lấy doanh thu tháng
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        const monthly = await reportService.getMonthlyRevenue(year, month);
        // Tính doanh thu tuần hiện tại (Thứ 2 - Chủ nhật)
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Nếu Chủ nhật thì = 7
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek + 1); // Đầu tuần (Thứ 2)
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        let weekRevenue = 0;
        if (monthly.dailyStats) {
          for (const stat of monthly.dailyStats) {
            // Đảm bảo stat.date là local date
            const d = new Date(stat.date + 'T00:00:00');
            if (d >= weekStart && d <= weekEnd) {
              weekRevenue += stat.totalRevenue;
            }
          }
        }
        setRevenue({
          day: daily.totalRevenue || 0,
          week: weekRevenue,
          month: monthly.totalRevenue || 0
        });
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