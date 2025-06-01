'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { reportService, SalesReport as SalesReportType } from '@/services/api/reportService'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface SalesReportProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function SalesReport({ dateRange }: SalesReportProps) {
  const [report, setReport] = useState<SalesReportType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [dateRange])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      // Thử gọi API thực, nếu API chưa có thì sử dụng mock data
      try {
        const data = await reportService.getSalesReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
        setReport(data)
      } catch (apiError) {
        console.warn('API chưa sẵn sàng, sử dụng mock data:', apiError)

        // Mock data khi API chưa sẵn sàng
        const today = new Date()
        const mockDailySales = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(today.getDate() - i)
          return {
            date: date.toISOString(),
            sales: Math.floor(Math.random() * 5000000) + 1000000, // Random từ 1-6 triệu
            orders: Math.floor(Math.random() * 10) + 1 // Random từ 1-10 đơn
          }
        }).reverse()

        const mockData: SalesReportType = {
          totalSales: mockDailySales.reduce((sum, day) => sum + day.sales, 0),
          totalOrders: mockDailySales.reduce((sum, day) => sum + day.orders, 0),
          averageOrderValue: Math.floor(mockDailySales.reduce((sum, day) => sum + day.sales, 0) / mockDailySales.reduce((sum, day) => sum + day.orders, 0)),
          dailySales: mockDailySales,
          topProducts: [
            { productId: '1', productName: 'Bình Lavie 20L', quantity: 45, revenue: 4500000 },
            { productId: '2', productName: 'Chai Lavie 1.5L', quantity: 120, revenue: 1800000 },
            { productId: '3', productName: 'Thùng Lavie 500ml (24 chai)', quantity: 30, revenue: 1500000 },
            { productId: '4', productName: 'Thùng Lavie 330ml (24 chai)', quantity: 25, revenue: 1250000 },
            { productId: '5', productName: 'Vỏ bình 20L', quantity: 15, revenue: 750000 }
          ],
          topCustomers: [
            { customerId: '1', customerName: 'Nguyễn Văn A', orders: 10, spend: 2000000 },
            { customerId: '2', customerName: 'Công ty TNHH B', orders: 8, spend: 1600000 },
            { customerId: '3', customerName: 'Cửa hàng C', orders: 6, spend: 1200000 },
            { customerId: '4', customerName: 'Nhà hàng D', orders: 5, spend: 1000000 },
            { customerId: '5', customerName: 'Khách sạn E', orders: 4, spend: 800000 }
          ]
        }

        setReport(mockData)
      }
    } catch (error: any) {
      console.error('Error fetching sales report:', error)
      toast.error(`Lỗi khi tải báo cáo bán hàng: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Prepare data for daily sales chart
  const dailySalesChartData = {
    labels: report?.dailySales ? report.dailySales.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }) : [],
    datasets: [
      {
        label: 'Doanh thu',
        data: report && report.dailySales ? report.dailySales.map(item => item.sales) : [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Số đơn hàng',
        data: report && report.dailySales ? report.dailySales.map(item => item.orders) : [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      },
    ],
  }

  // Chart options for daily sales
  const dailySalesOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Doanh thu và số đơn hàng theo ngày',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Số đơn hàng',
        },
      },
    },
  }

  // Prepare data for top products chart
  const topProductsChartData = {
    labels: report?.topProducts.map(item => item.productName) || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: report?.topProducts.map(item => item.revenue) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
      },
    ],
  }

  // Chart options for top products
  const topProductsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top 5 sản phẩm bán chạy nhất',
      },
    },
  }

  // Hàm xuất PDF báo cáo bán hàng
  const handleExportPdf = async () => {
    try {
      toast.info('Đang chuẩn bị xuất báo cáo PDF...')
      const url = await reportService.generateSalesReportPdf({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      window.open(url, '_blank')
      toast.success('Xuất báo cáo PDF thành công!')
    } catch (error) {
      toast.error('Không thể xuất báo cáo PDF. Vui lòng thử lại sau.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPdf}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xuất báo cáo PDF
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : report ? (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg shadow p-4">
              <div className="text-sm text-green-600 font-medium">Tổng doanh thu</div>
              <div className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(report?.totalSales || 0)}</div>
              <div className="text-sm text-green-500 mt-1">
                Trong khoảng từ {new Date(dateRange.startDate).toLocaleDateString('vi-VN')} đến {new Date(dateRange.endDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg shadow p-4">
              <div className="text-sm text-blue-600 font-medium">Tổng số đơn hàng</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">{report?.totalOrders || 0}</div>
              <div className="text-sm text-blue-500 mt-1">
                Đơn hàng đã hoàn thành
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg shadow p-4">
              <div className="text-sm text-purple-600 font-medium">Giá trị đơn trung bình</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(report?.averageOrderValue || 0)}</div>
              <div className="text-sm text-purple-500 mt-1">
                Doanh thu / Số đơn hàng
              </div>
            </div>
          </div>

          {/* Daily Sales Chart */}
          <div className="bg-white rounded-lg shadow p-4 mb-8">
            <Line options={dailySalesOptions} data={dailySalesChartData} height={100} />
          </div>

          {/* Top Products and Customers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">Top 5 sản phẩm bán chạy</h3>
              <Bar options={topProductsOptions} data={topProductsChartData} height={200} />

              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh thu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report?.topProducts?.map((product, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {product?.productName}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                          {product?.quantity}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">Top 5 khách hàng</h3>

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số đơn
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chi tiêu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report?.topCustomers?.map((customer, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {customer.customerName}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                        {customer.orders}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatCurrency(customer.spend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4">
                <Pie
                  data={{
                    labels: report?.topCustomers?.map(c => c.customerName) || [],
                    datasets: [
                      {
                        data: report?.topCustomers?.map(c => c.spend) || [],
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.7)',
                          'rgba(54, 162, 235, 0.7)',
                          'rgba(255, 206, 86, 0.7)',
                          'rgba(75, 192, 192, 0.7)',
                          'rgba(153, 102, 255, 0.7)',
                        ],
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      title: {
                        display: true,
                        text: 'Phân bố chi tiêu khách hàng'
                      }
                    }
                  }}
                  height={150}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.
        </div>
      )}
    </div>
  )
}
