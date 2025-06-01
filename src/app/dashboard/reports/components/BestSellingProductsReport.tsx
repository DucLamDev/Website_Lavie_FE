'use client'

import { useState, useEffect } from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FaFileDownload } from 'react-icons/fa'
import { reportService, BestSellingProduct } from '@/services/api/reportService'
import { formatCurrency } from '@/lib/utils'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BestSellingProductsReportProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function BestSellingProductsReport({ dateRange }: BestSellingProductsReportProps) {
  const [products, setProducts] = useState<BestSellingProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [limit, setLimit] = useState(10)
  
  useEffect(() => {
    fetchBestSellingProducts()
  }, [dateRange, limit])
  
  const fetchBestSellingProducts = async () => {
    setIsLoading(true)
    try {
      const data = await reportService.getBestSellingProducts({
        limit,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      setProducts(data)
    } catch (error) {
      console.error('Error fetching best selling products:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value))
  }
  
  const handleExportPdf = async () => {
    try {
      const url = await reportService.generateBestSellingProductsReportPdf({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit
      })
      window.open(url, '_blank')
    } catch (error) {
      // Xử lý lỗi nếu cần
    }
  }
  
  // Chart data for quantity sold
  const quantityChartData = {
    labels: products.map(product => product.productName),
    datasets: [
      {
        label: 'Số lượng đã bán',
        data: products.map(product => product.totalQuantity),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }
  
  // Chart data for revenue
  const revenueChartData = {
    labels: products.map(product => product.productName),
    datasets: [
      {
        label: 'Doanh thu',
        data: products.map(product => product.totalRevenue),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sản phẩm bán chạy nhất</h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <label htmlFor="limit" className="mr-2">Hiển thị:</label>
            <select
              id="limit"
              value={limit}
              onChange={handleLimitChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <button
            onClick={handleExportPdf}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <FaFileDownload className="mr-2" />
            Xuất báo cáo tồn kho
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : products.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Top sản phẩm theo số lượng bán</h3>
              <div className="h-80">
                <Bar 
                  data={quantityChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y' as const,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Top sản phẩm theo doanh thu</h3>
              <div className="h-80">
                <Bar 
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y' as const,
                    scales: {
                      x: {
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(Number(value))
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Doanh thu: ${formatCurrency(context.parsed.x)}`
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng đã bán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số đơn hàng</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.unit || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.totalQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.price ? formatCurrency(product.price) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(product.totalRevenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Không có dữ liệu sản phẩm bán chạy trong khoảng thời gian này</p>
        </div>
      )}
    </div>
  )
}
