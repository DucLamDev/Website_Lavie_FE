'use client'

import { useState, useEffect } from 'react'
import { FaFilePdf, FaSearch, FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { inventoryService } from '@/services/api/inventoryService'

type InventoryReportItem = {
  productId: string
  productName: string
  currentStock: number
  stockMovements: {
    import: number
    export: number
    return: number
  }
  netChange: number
  logs: {
    date: string
    type: string
    quantity: number
    note: string
  }[]
}

type InventoryReport = {
  startDate: string
  endDate: string
  products: InventoryReportItem[]
}

export default function InventoryReportPage() {
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 30)))
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [report, setReport] = useState<InventoryReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport()
    }
  }, [])

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn ngày bắt đầu và ngày kết thúc')
      return
    }

    setIsLoading(true)
    try {
      const data = await inventoryService.getInventoryReportByDate(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      setReport(data)
    } catch (error) {
      toast.error('Không thể tải báo cáo tồn kho')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const pdfUrl = await inventoryService.exportInventoryReport()
      window.open(pdfUrl, '_blank')
    } catch (error) {
      toast.error('Không thể xuất báo cáo PDF')
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  const filteredProducts = report?.products.filter(product => 
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Báo Cáo Tồn Kho Theo Ngày</h1>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={handleExportPDF}
          disabled={isExporting}
        >
          {isExporting ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
          Xuất PDF
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="label">Từ ngày</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="input w-full"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div>
            <label className="label">Đến ngày</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="input w-full"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="flex items-end">
            <button
              className="btn btn-primary h-10 w-full"
              onClick={fetchReport}
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : 'Xem báo cáo'}
            </button>
          </div>
          <div>
            <label className="label">Tìm kiếm sản phẩm</label>
            <div className="relative">
              <input
                type="text"
                className="input w-full pl-10"
                placeholder="Tìm theo tên sản phẩm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-4xl text-primary-500" />
          </div>
        ) : report ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left">Sản phẩm</th>
                  <th className="px-4 py-2 text-center">Tồn kho hiện tại</th>
                  <th className="px-4 py-2 text-center">Nhập</th>
                  <th className="px-4 py-2 text-center">Xuất</th>
                  <th className="px-4 py-2 text-center">Trả</th>
                  <th className="px-4 py-2 text-center">Thay đổi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((item) => (
                    <tr key={item.productId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-4 py-3">{item.productName}</td>
                      <td className="px-4 py-3 text-center">{item.currentStock}</td>
                      <td className="px-4 py-3 text-center">{item.stockMovements.import}</td>
                      <td className="px-4 py-3 text-center">{item.stockMovements.export}</td>
                      <td className="px-4 py-3 text-center">{item.stockMovements.return}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${item.netChange > 0 ? 'text-green-600' : item.netChange < 0 ? 'text-red-600' : ''}`}>
                          {item.netChange > 0 ? '+' : ''}{item.netChange}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center">
                      {searchTerm ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Không có dữ liệu báo cáo trong khoảng thời gian này'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Vui lòng chọn khoảng thời gian và nhấn "Xem báo cáo" để xem báo cáo tồn kho
          </div>
        )}
      </div>
    </div>
  )
}
