'use client'

import { useState, useEffect } from 'react'
import { 
  FaUsers, 
  FaWater, 
  FaShoppingCart, 
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import { dashboardService } from '@/services/api/dashboardService'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// Stat card component
function StatCard({ title, value, icon, change, changeType }: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode,
  change?: number,
  changeType?: 'increase' | 'decrease'
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <FaArrowUp className="text-green-500 mr-1" />
              ) : (
                <FaArrowDown className="text-red-500 mr-1" />
              )}
              <span className={`text-sm ${
                changeType === 'increase' ? 'text-green-500' : 'text-red-500'
              }`}>
                {change}% so với tháng trước
              </span>
            </div>
          )}
        </div>
        <div className="bg-primary-100 dark:bg-primary-800 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    orders: 0,
    revenue: 0
  })
  const [chartData, setChartData] = useState<{
    ordersByDay: {
      labels: string[];
      data: number[];
    };
    revenueByProduct: {
      labels: string[];
      data: number[];
    };
    recentOrders: Array<{
      _id: string;
      customerName: string;
      orderDate: string;
      status: string;
      totalAmount: number;
    }>;
  }>({
    ordersByDay: {
      labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      data: [0, 0, 0, 0, 0, 0, 0]
    },
    revenueByProduct: {
      labels: [],
      data: []
    },
    recentOrders: []
  })
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch real data from the API
      console.log('Fetching dashboard data from API...')
      const data = await dashboardService.getDashboardStats()
      console.log('Dashboard data received:', data)
      
      setStats({
        customers: data.customers || 0,
        products: data.products || 0,
        orders: data.orders || 0,
        revenue: data.revenue || 0
      })
      
      setChartData({
        ordersByDay: data.ordersByDay || {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          data: [0, 0, 0, 0, 0, 0, 0]
        },
        revenueByProduct: data.revenueByProduct || {
          labels: [],
          data: []
        },
        recentOrders: data.recentOrders || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      
      // Fallback to sample data if API fails
      const fallbackData = {
        customers: 5,
        products: 5,
        orders: 20,
        revenue: 8650000,
        ordersByDay: {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          data: [3, 5, 2, 4, 3, 2, 1]
        },
        revenueByProduct: {
          labels: ['Bình 20L', 'Bình 500ml', 'Thùng 330ml'],
          data: [65, 20, 15]
        },
        recentOrders: [
          { _id: '1', customerName: 'Nguyễn Văn A', orderDate: '2025-05-15', status: 'completed', totalAmount: 120000 }
        ]
      }
      
      setStats({
        customers: fallbackData.customers,
        products: fallbackData.products,
        orders: fallbackData.orders,
        revenue: fallbackData.revenue
      })
      
      setChartData({
        ordersByDay: fallbackData.ordersByDay,
        revenueByProduct: fallbackData.revenueByProduct,
        recentOrders: fallbackData.recentOrders
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get current date in Vietnamese format
  const currentDate = format(new Date(), 'EEEE, dd MMMM yyyy', { locale: vi })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tổng quan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{currentDate}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Khách hàng" 
            value={stats.customers} 
            icon={<FaUsers className="h-6 w-6 text-primary-600" />}
            change={5.2}
            changeType="increase"
          />
          <StatCard 
            title="Sản phẩm" 
            value={stats.products} 
            icon={<FaWater className="h-6 w-6 text-primary-600" />}
          />
          <StatCard 
            title="Đơn hàng" 
            value={stats.orders} 
            icon={<FaShoppingCart className="h-6 w-6 text-primary-600" />}
            change={12.5}
            changeType="increase"
          />
          <StatCard 
            title="Doanh thu" 
            value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)} 
            icon={<FaMoneyBillWave className="h-6 w-6 text-primary-600" />}
            change={3.8}
            changeType="increase"
          />
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Đơn hàng trong tuần</h2>
            <div className="h-80">
              <Bar
                data={{
                  labels: chartData.ordersByDay.labels,
                  datasets: [
                    {
                      label: 'Đơn hàng',
                      data: chartData.ordersByDay.data,
                      backgroundColor: 'rgba(14, 165, 233, 0.7)',
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Doanh thu theo sản phẩm</h2>
            <div className="h-80">
              <Pie
                data={{
                  labels: chartData.revenueByProduct.labels,
                  datasets: [
                    {
                      label: 'Doanh thu',
                      data: chartData.revenueByProduct.data,
                      backgroundColor: [
                        'rgba(14, 165, 233, 0.7)',
                        'rgba(6, 182, 212, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(249, 115, 22, 0.7)',
                        'rgba(236, 72, 153, 0.7)',
                        'rgba(139, 92, 246, 0.7)'
                      ],
                      borderColor: [
                        'rgba(14, 165, 233, 1)',
                        'rgba(6, 182, 212, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(139, 92, 246, 1)'
                      ],
                      borderWidth: 1,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Đơn hàng gần đây</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {chartData.recentOrders && chartData.recentOrders.length > 0 ? (
                    chartData.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'pending' ? 'bg-blue-100 text-blue-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'completed' ? 'Hoàn thành' : 
                             order.status === 'pending' ? 'Đang xử lý' : 'Hủy'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        Không có dữ liệu đơn hàng gần đây
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
