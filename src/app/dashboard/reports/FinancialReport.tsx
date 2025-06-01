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
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { reportService, FinancialReport as FinancialReportType } from '@/services/api/reportService'
import StatCard from './components/StatCard'
import { 
  FaCoins, 
  FaChartLine, 
  FaFileInvoiceDollar,
  FaArrowUp, 
  FaArrowDown 
} from 'react-icons/fa'

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
  ArcElement,
  Filler
)

interface FinancialReportProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function FinancialReport({ dateRange }: FinancialReportProps) {
  const [report, setReport] = useState<FinancialReportType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchReport()
  }, [dateRange])
  
  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const data = await reportService.getFinancialReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      setReport(data)
    } catch (error: any) {
      console.error('Error fetching financial report:', error)
      toast.error(`Lỗi khi tải báo cáo tài chính: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleExportPdf = async () => {
    try {
      toast.info('Đang chuẩn bị xuất báo cáo PDF...')
      const url = await reportService.generateFinancialReportPdf({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      window.open(url, '_blank')
      toast.success('Xuất báo cáo PDF thành công!')
    } catch (error) {
      toast.error('Không thể xuất báo cáo PDF. Vui lòng thử lại sau.')
    }
  }
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }
  
  // Prepare data for daily financial chart
  const dailyFinancialsChartData = {
    labels: report?.dailyFinancials?.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }) || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: report?.dailyFinancials?.map(item => item.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Chi phí',
        data: report?.dailyFinancials.map(item => item.expenses) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Lợi nhuận',
        data: report?.dailyFinancials.map(item => item.profit) || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        fill: false,
        tension: 0.1,
      },
    ],
  }
  
  // Chart options for daily financials
  const dailyFinancialsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doanh thu, chi phí và lợi nhuận theo ngày',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số tiền (VNĐ)',
        },
      },
    },
  }
  
  // Prepare data for revenue by category chart
  const revenueByCategoryChartData = {
    labels: report?.revenueByCategory.map(item => item.category) || [],
    datasets: [
      {
        data: report?.revenueByCategory.map(item => item.amount) || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(255, 206, 86)',
          'rgb(255, 159, 64)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  }
  
  // Prepare data for expenses by category chart
  const expensesByCategoryChartData = {
    labels: report?.expensesByCategory.map(item => item.category) || [],
    datasets: [
      {
        data: report?.expensesByCategory.map(item => item.amount) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 206, 86)',
          'rgb(153, 102, 255)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
        ],
        borderWidth: 1,
      },
    ],
  }
  
  // Chart options for category charts
  const categoryChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed);
              // Add percentage
              const categoryData = context.dataset.data;
              const total = categoryData.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((context.parsed / total) * 100);
              label += ` (${percentage}%)`;
            }
            return label;
          }
        }
      }
    },
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPdf}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
              <div className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(report.totalRevenue)}</div>
              <div className="text-sm text-green-500 mt-1">
                Trong khoảng thời gian đã chọn
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg shadow p-4">
              <div className="text-sm text-red-600 font-medium">Tổng chi phí</div>
              <div className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(report.totalExpenses)}</div>
              <div className="text-sm text-red-500 mt-1">
                Trong khoảng thời gian đã chọn
              </div>
            </div>
            
            <div className={`${report.netProfit >= 0 ? 'bg-blue-50' : 'bg-red-50'} rounded-lg shadow p-4`}>
              <div className={`text-sm ${report.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'} font-medium`}>
                Lợi nhuận ròng
              </div>
              <div className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'} mt-1 flex items-center`}>
                {formatCurrency(Math.abs(report.netProfit))}
                {report.netProfit >= 0 ? (
                  <FaArrowUp className="ml-2 text-blue-700" />
                ) : (
                  <FaArrowDown className="ml-2 text-red-700" />
                )}
              </div>
              <div className={`text-sm ${report.netProfit >= 0 ? 'text-blue-500' : 'text-red-500'} mt-1`}>
                {report.netProfit >= 0 ? 'Có lãi' : 'Bị lỗ'}
              </div>
            </div>
          </div>
          
          {/* Daily Financials Chart */}
          <div className="bg-white rounded-lg shadow p-4 mb-8">
            <Line options={dailyFinancialsOptions} data={dailyFinancialsChartData} height={100} />
          </div>
          
          {/* Revenue and Expense Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">Doanh thu theo danh mục</h3>
              
              <div className="mb-4" style={{ height: '250px' }}>
                <Doughnut data={revenueByCategoryChartData} options={categoryChartOptions} />
              </div>
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.revenueByCategory.map((category, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {category.category}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(category.amount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                        {category.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">Chi phí theo danh mục</h3>
              
              <div className="mb-4" style={{ height: '250px' }}>
                <Doughnut data={expensesByCategoryChartData} options={categoryChartOptions} />
              </div>
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chi phí
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.expensesByCategory.map((category, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {category.category}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(category.amount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                        {category.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Revenue/Expense Ratio */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-4">Tỷ lệ doanh thu và chi phí</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {report && (
                <>
                  <StatCard 
                    title="Tổng doanh thu" 
                    value={formatCurrency(report?.totalRevenue || 0)} 
                    icon={<FaCoins className="text-green-600" />} 
                  />
                  <StatCard 
                    title="Tổng chi phí" 
                    value={formatCurrency(report?.totalExpenses || 0)} 
                    icon={<FaFileInvoiceDollar className="text-red-600" />} 
                  />
                  <StatCard 
                    title="Lợi nhuận ròng" 
                    value={formatCurrency(report?.netProfit || 0)} 
                    icon={<FaChartLine className="text-primary-600" />} 
                  />
                </>
              )}
              <div className="md:col-span-2">
                <Bar 
                  data={{
                    labels: ['Doanh thu và Chi phí'],
                    datasets: [
                      {
                        label: 'Doanh thu',
                        data: [report?.totalRevenue || 0],
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 1,
                      },
                      {
                        label: 'Chi phí',
                        data: [report?.totalExpenses || 0],
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Số tiền (VNĐ)',
                        },
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context: any) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed.y !== null) {
                              label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                            }
                            return label;
                          }
                        }
                      }
                    }
                  }}
                  height={150}
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-1">Tỷ lệ chi phí/doanh thu</div>
                  <div className="text-3xl font-bold text-primary-700">
                    {report?.totalRevenue > 0 
                      ? `${Math.round((report?.totalExpenses || 0) / report.totalRevenue * 100)}%` 
                      : 'N/A'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Biên lợi nhuận</div>
                  <div className={`text-3xl font-bold ${(report?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {report?.totalRevenue > 0 
                      ? `${Math.round((report?.netProfit || 0) / report.totalRevenue * 100)}%` 
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Không thể tải dữ liệu báo cáo tài chính. Vui lòng thử lại sau.
        </div>
      )}
    </div>
  )
}
