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
import { Line } from 'react-chartjs-2'
import { reportService, CustomerDebtReport as CustomerDebtReportType } from '@/services/api/reportService'
import { FaExclamationTriangle, FaPhone, FaCalendarAlt } from 'react-icons/fa'

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

interface CustomerDebtReportProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function CustomerDebtReport({ dateRange }: CustomerDebtReportProps) {
  const [report, setReport] = useState<CustomerDebtReportType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchReport()
  }, [dateRange])
  
  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const data = await reportService.getCustomerDebtReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      setReport(data)
    } catch (error: any) {
      console.error('Error fetching customer debt report:', error)
      toast.error(`Lỗi khi tải báo cáo công nợ khách hàng: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Debt over time chart data
  const debtOverTimeChartData = {
    labels: report?.debtByTime?.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }) || [],
    datasets: [
      {
        label: 'Công nợ khách hàng',
        data: report?.debtByTime?.map(item => item.amount) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
        fill: true,
      }
    ]
  }
  
  const debtOverTimeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Biến động công nợ theo thời gian',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND',
              maximumFractionDigits: 0
            }).format(value)
          }
        }
      }
    }
  }
  
  // Hàm xuất PDF báo cáo công nợ khách hàng
  const handleExportPdf = async () => {
    try {
      toast.info('Đang chuẩn bị xuất báo cáo PDF...')
      const url = await reportService.generateCustomerDebtReportPdf({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      window.open(url, '_blank')
      toast.success('Xuất báo cáo PDF thành công!')
    } catch (error: any) {
      console.error('Error exporting PDF:', error)
      toast.error(`Lỗi khi xuất PDF: ${error.message || 'Unknown error'}`)
    }
  }
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Export PDF Button */}
          <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPdf}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xuất báo cáo PDF
        </button>
      </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-medium text-gray-500">Tổng công nợ</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(report?.totalDebt || 0)}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-medium text-gray-500">Khách hàng có công nợ</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {report?.totalCustomers || 0} khách hàng
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-medium text-gray-500">Đơn hàng chưa thanh toán</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {report?.pendingOrders || 0} đơn hàng
              </p>
            </div>
          </div>
          
          {/* Debt Over Time Chart */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <Line data={debtOverTimeChartData} options={debtOverTimeChartOptions} />
          </div>
          
          {/* Customer Debt Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Chi tiết công nợ khách hàng</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Công nợ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn chưa thanh toán
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn hàng gần nhất
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report?.customerDebts && report.customerDebts.length > 0 ? (
                    report.customerDebts.map((customer) => (
                      <tr key={customer.customerId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FaPhone className="mr-1 text-xs" /> {customer.customerPhone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-red-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(customer.totalDebt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {customer.pendingOrders} đơn
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1 text-xs" />
                            {new Date(customer.lastOrderDate).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center py-6">
                          <FaExclamationTriangle className="text-yellow-400 text-4xl mb-2" />
                          <p>Không có dữ liệu công nợ khách hàng</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
