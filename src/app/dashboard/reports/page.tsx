'use client'

import { useState, useEffect } from 'react'
import { FaChartLine, FaUsers, FaTruck, FaMoneyBillWave, FaCalendarAlt, FaDownload, FaChartBar, FaChartPie, FaBoxOpen } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { reportService } from '@/services/api/reportService'
import SalesReport from './SalesReport'
import CustomerDebtReport from './CustomerDebtReport'
import SupplierDebtReport from './SupplierDebtReport'
import FinancialReport from './FinancialReport'
import RevenueReport from './components/RevenueReport'
import BestSellingProductsReport from './components/BestSellingProductsReport'

type ReportType = 'inventory' | 'customer-debt' | 'supplier-debt' | 'financial' | 'revenue' | 'best-selling' | 'sales'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('inventory')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  })

  // Handle tab change
  const handleTabChange = (tab: ReportType) => {
    setActiveTab(tab)
  }

  // Handle date range change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'startDate' | 'endDate') => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    })
  }

  // Export report to PDF
  const exportReport = async () => {
    try {
      toast.info('Đang chuẩn bị xuất báo cáo PDF...')
      let url: string

      switch (activeTab) {
        case 'inventory':
          url = await reportService.generateInventoryReportPdf()
          window.open(url, '_blank')
          break
        case 'sales':
          url = await reportService.generateSalesReportPdf({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          })
          window.open(url, '_blank')
          break
        case 'customer-debt':
          url = await reportService.generateCustomerDebtReportPdf({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          })
          window.open(url, '_blank')
          break
        case 'supplier-debt':
          url = await reportService.generateSupplierDebtReportPdf({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          })
          window.open(url, '_blank')
          break
        case 'revenue':
          url = await reportService.generateRevenueReportPdf({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          })
          window.open(url, '_blank')
          break
        case 'best-selling':
          url = await reportService.generateBestSellingProductsReportPdf({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          })
          window.open(url, '_blank')
          break
        case 'financial':
          url = await reportService.generateFinancialReportPdf({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          })
          window.open(url, '_blank')
          break
        default:
          toast.info('Chức năng xuất báo cáo đang được phát triển cho mục này.')
      }
    } catch (error: any) {
      console.error('Error exporting report:', error)
      toast.error(`Lỗi khi xuất báo cáo: ${error.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo</h1>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={exportReport}
        >
          <FaDownload className="mr-2" />
          Xuất báo cáo
        </button>
      </div> */}

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="font-medium text-gray-700">Chọn khoảng thời gian:</div>
          <div className="flex space-x-2 flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange(e, 'startDate')}
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange(e, 'endDate')}
              />
            </div>
          </div>

          {/* Quick Date Selectors */}
          <div className="flex space-x-2">
            <button
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() => {
                const today = new Date()
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                setDateRange({
                  startDate: lastWeek.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0]
                })
              }}
            >
              7 ngày
            </button>
            <button
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() => {
                const today = new Date()
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                setDateRange({
                  startDate: lastMonth.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0]
                })
              }}
            >
              30 ngày
            </button>
            <button
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() => {
                const today = new Date()
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                setDateRange({
                  startDate: firstDayOfMonth.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0]
                })
              }}
            >
              Tháng này
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {/* <button
              className={`${activeTab === 'inventory'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange('inventory')}
            >
              <FaBoxOpen className="inline-block mr-2" />
              Báo cáo sản phẩm tồn kho
            </button> */}
            <button
              className={`${activeTab === 'sales'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange('sales')}
            >
              <FaChartLine className="inline-block mr-2" />
              Báo cáo bán hàng
            </button>
            <button
              className={`${activeTab === 'customer-debt'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange('customer-debt')}
            >
              <FaUsers className="inline-block mr-2" />
              Công nợ khách hàng
            </button>
            <button
              className={`${activeTab === 'supplier-debt'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange('supplier-debt')}
            >
              <FaTruck className="inline-block mr-2" />
              Công nợ nhà cung cấp
            </button>
            <button
              className={`${activeTab === 'financial'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange('financial')}
            >
              <FaMoneyBillWave className="inline-block mr-2" />
              Báo cáo tài chính
            </button>
            <button
              className={`${activeTab === 'revenue'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange('revenue')}
            >
              <FaChartBar className="inline-block mr-2" />
              Doanh thu
            </button>
            <button
              className={`${activeTab === 'best-selling'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange('best-selling')}
            >
              <FaChartPie className="inline-block mr-2" />
              Sản phẩm bán chạy
            </button>
          </nav>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'sales' && <SalesReport dateRange={dateRange} />}
        {activeTab === 'customer-debt' && <CustomerDebtReport dateRange={dateRange} />}
        {activeTab === 'supplier-debt' && <SupplierDebtReport dateRange={dateRange} />}
        {activeTab === 'financial' && <FinancialReport dateRange={dateRange} />}
        {activeTab === 'revenue' && <RevenueReport dateRange={dateRange} />}
        {activeTab === 'best-selling' && <BestSellingProductsReport dateRange={dateRange} />}
      </div>
    </div>
  )
}
