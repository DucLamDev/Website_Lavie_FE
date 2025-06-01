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
import { reportService, SupplierDebtReport as SupplierDebtReportType } from '@/services/api/reportService'
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

interface SupplierDebtReportProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function SupplierDebtReport({ dateRange }: SupplierDebtReportProps) {
  const [report, setReport] = useState<SupplierDebtReportType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchReport()
  }, [dateRange])
  
  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const data = await reportService.getSupplierDebtReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      setReport(data)
    } catch (error: any) {
      console.error('Error fetching supplier debt report:', error)
      toast.error(`Lỗi khi tải báo cáo công nợ nhà cung cấp: ${error.message || 'Unknown error'}`)
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
        label: 'Công nợ nhà cung cấp',
        data: report?.debtByTime?.map(item => item.amount) || [],
        borderColor: 'rgb(220, 53, 69)',
        backgroundColor: 'rgba(220, 53, 69, 0.5)',
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
  
  // Hàm xuất PDF báo cáo công nợ nhà cung cấp
  const handleExportPdf = async () => {
    try {
      toast.info('Đang chuẩn bị xuất báo cáo PDF...')
      const url = await reportService.generateSupplierDebtReportPdf({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      window.open(url, '_blank')
      toast.success('Xuất báo cáo PDF thành công!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Không thể xuất báo cáo PDF. Vui lòng thử lại sau.')
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPdf}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Xuất báo cáo PDF
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {/* Export PDF Button */}
          {/* <div className="flex justify-end mb-4">
            <button
              onClick={handleExportPdf}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Xuất PDF
            </button>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-medium text-gray-500">Tổng công nợ</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(report?.totalDebt || 0)}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-medium text-gray-500">Nhà cung cấp có công nợ</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {report?.totalSuppliers || 0} nhà cung cấp
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-medium text-gray-500">Thanh toán chưa hoàn tất</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {report?.pendingPayments || 0} giao dịch
              </p>
            </div>
          </div>
          
          {/* Debt Over Time Chart */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <Line data={debtOverTimeChartData} options={debtOverTimeChartOptions} />
          </div>
          
          {/* Supplier Debt Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Chi tiết công nợ nhà cung cấp</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhà cung cấp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Công nợ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thanh toán chưa hoàn tất
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mua hàng gần nhất
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report?.supplierDebts && report.supplierDebts.length > 0 ? (
                    report.supplierDebts.map((supplier) => (
                      <tr key={supplier.supplierId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{supplier.supplierName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FaPhone className="mr-1 text-xs" /> {supplier.supplierPhone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-red-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(supplier.totalDebt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {supplier.pendingPayments} giao dịch
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1 text-xs" />
                            {new Date(supplier.lastPurchaseDate).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center py-6">
                          <FaExclamationTriangle className="text-yellow-400 text-4xl mb-2" />
                          <p>Không có dữ liệu công nợ nhà cung cấp</p>
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
