'use client'

import { useState, useEffect } from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { FaFileDownload, FaCalendarAlt } from 'react-icons/fa'
import { reportService, MonthlyRevenueReport, DailyRevenueReport } from '@/services/api/reportService'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-toastify'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface RevenueReportProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function RevenueReport({ dateRange }: RevenueReportProps) {
  const [monthlyReport, setMonthlyReport] = useState<MonthlyRevenueReport | null>(null)
  const [dailyReport, setDailyReport] = useState<DailyRevenueReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  
  useEffect(() => {
    fetchMonthlyReport()
    fetchDailyReport()
  }, [selectedMonth, selectedYear, selectedDate])
  
  const fetchMonthlyReport = async () => {
    setIsLoading(true)
    try {
      const data = await reportService.getMonthlyRevenue(selectedYear, selectedMonth)
      setMonthlyReport(data)
    } catch (error) {
      console.error('Error fetching monthly revenue report:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchDailyReport = async () => {
    setIsLoading(true)
    try {
      const data = await reportService.getDailyRevenue(selectedDate)
      setDailyReport(data)
    } catch (error) {
      console.error('Error fetching daily revenue report:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value))
  }
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value))
  }
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }
  
   const handleExportPdf = async () => {
      try {
        toast.info('Đang chuẩn bị xuất báo cáo PDF...')
        const url = await reportService.generateRevenueReportPdf({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
        window.open(url, '_blank')
        toast.success('Xuất báo cáo PDF thành công!')
      } catch (error) {
        toast.error('Không thể xuất báo cáo PDF. Vui lòng thử lại sau.')
      }
    }

  
  // Monthly revenue chart data
  const monthlyChartData = {
    labels: monthlyReport?.dailyStats.map(stat => stat.date) || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: monthlyReport?.dailyStats.map(stat => stat.totalRevenue) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }
  
  // Monthly orders chart data
  const monthlyOrdersChartData = {
    labels: monthlyReport?.dailyStats.map(stat => stat.date) || [],
    datasets: [
      {
        label: 'Số đơn hàng',
        data: monthlyReport?.dailyStats.map(stat => stat.totalOrders) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Báo cáo doanh thu</h2>
        <button
          onClick={handleExportPdf}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <FaFileDownload className="mr-2" />
          Xuất báo cáo PDF
        </button>
      </div>
      
      {/* Monthly Revenue Report */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Doanh thu theo tháng</h3>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <label htmlFor="month" className="mr-2">Tháng:</label>
              <select
                id="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label htmlFor="year" className="mr-2">Năm:</label>
              <select
                id="year"
                value={selectedYear}
                onChange={handleYearChange}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return <option key={year} value={year}>{year}</option>
                })}
              </select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : monthlyReport ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500 mb-1">Tổng doanh thu</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyReport.totalRevenue)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500 mb-1">Đã thanh toán</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyReport.totalPaid)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500 mb-1">Còn nợ</h4>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyReport.totalDebt)}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Biểu đồ doanh thu theo ngày</h4>
              <div className="h-80">
                <Line 
                  data={monthlyChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(Number(value))
                          }
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Doanh thu: ${formatCurrency(context.parsed.y)}`
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-2">Biểu đồ số đơn hàng theo ngày</h4>
              <div className="h-80">
                <Bar 
                  data={monthlyOrdersChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có dữ liệu doanh thu cho tháng này</p>
          </div>
        )}
      </div>
      
      {/* Daily Revenue Report */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Doanh thu theo ngày</h3>
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : dailyReport ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500 mb-1">Tổng doanh thu</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(dailyReport.totalRevenue)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500 mb-1">Số đơn hàng</h4>
                <p className="text-2xl font-bold text-purple-600">{dailyReport.totalOrders}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500 mb-1">Đã thanh toán</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(dailyReport.totalPaid)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500 mb-1">Còn nợ</h4>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(dailyReport.totalDebt)}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-2">Chi tiết đơn hàng</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã thanh toán</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Còn nợ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyReport.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(order.paid)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(order.debt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            // onClick={() => window.open(reportService.generateInvoicePdf(order.id), '_blank')}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Xuất hoá đơn
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có dữ liệu doanh thu cho ngày này</p>
          </div>
        )}
      </div>
    </div>
  )
}
