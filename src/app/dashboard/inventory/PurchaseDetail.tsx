'use client'

import { useState } from 'react'
import { inventoryService, Purchase } from '@/services/api/inventoryService'
import { toast } from 'react-toastify'
import { FaPrint, FaFileInvoice } from 'react-icons/fa'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PurchaseDetailProps {
  purchase: Purchase
  onUpdate: (purchase: Purchase) => void
}

export default function PurchaseDetail({ purchase, onUpdate }: PurchaseDetailProps) {
  const [paidAmount, setPaidAmount] = useState<number>(purchase.paidAmount)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const handleUpdatePayment = async () => {
    if (paidAmount < 0 || paidAmount > purchase.totalAmount) {
      toast.error('Vui lòng nhập số tiền hợp lệ')
      return
    }
    
    setIsUpdating(true)
    
    try {
      const updatedPurchase = await inventoryService.updatePurchasePayment(purchase._id!, paidAmount)
      onUpdate(updatedPurchase)
      toast.success('Cập nhật thanh toán thành công!')
    } catch (error: any) {
      console.error('Error updating payment:', error)
      toast.error(`Lỗi khi cập nhật thanh toán: ${error.message || 'Unknown error'}`)
    } finally {
      setIsUpdating(false)
    }
  }
  
  const generatePDF = () => {
    const doc = new jsPDF()
    
    // Add company info
    doc.setFontSize(20)
    doc.text('LAVIE WATER MANAGEMENT', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text('PHIẾU NHẬP KHO', 105, 30, { align: 'center' })
    
    // Add purchase info
    doc.setFontSize(10)
    doc.text(`Mã phiếu: ${purchase.purchaseNumber || `PO-${purchase._id?.slice(-6)}`}`, 14, 40)
    doc.text(`Ngày tạo: ${new Date(purchase.createdAt || Date.now()).toLocaleDateString('vi-VN')}`, 14, 45)
    doc.text(`Nhà cung cấp: ${purchase.supplier?.name || ''}`, 14, 50)
    doc.text(`Trạng thái: ${purchase.status === 'pending' ? 'Đang chờ' : purchase.status === 'received' ? 'Đã nhận hàng' : 'Đã hủy'}`, 14, 55)
    
    if (purchase.receivedDate) {
      doc.text(`Ngày nhận hàng: ${new Date(purchase.receivedDate).toLocaleDateString('vi-VN')}`, 14, 60)
    }
    
    // Add items table
    autoTable(doc, {
      startY: 70,
      head: [['STT', 'Sản phẩm', 'Đơn giá', 'Số lượng', 'Thành tiền']],
      body: purchase.items.map((item, index) => [
        index + 1,
        item.product?.name || `Sản phẩm #${item.productId}`,
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price),
        item.quantity,
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)
      ]),
      foot: [
        ['', '', '', 'Tổng tiền:', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(purchase.totalAmount)],
        ['', '', '', 'Đã thanh toán:', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(purchase.paidAmount)],
        ['', '', '', 'Còn lại:', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(purchase.totalAmount - purchase.paidAmount)]
      ],
      theme: 'striped',
      headStyles: { fillColor: [28, 102, 161] },
      footStyles: { fillColor: [239, 246, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
    })
    
    const tableEndY = (doc as any).lastAutoTable.finalY + 10
    
    // Add note
    if (purchase.note) {
      doc.text(`Ghi chú: ${purchase.note}`, 14, tableEndY + 5)
    }
    
    // Add signature areas
    doc.text('Người nhận hàng', 40, tableEndY + 30, { align: 'center' })
    doc.text('(Ký, ghi rõ họ tên)', 40, tableEndY + 35, { align: 'center' })
    
    doc.text('Người lập phiếu', 160, tableEndY + 30, { align: 'center' })
    doc.text('(Ký, ghi rõ họ tên)', 160, tableEndY + 35, { align: 'center' })
    
    // Save the PDF
    doc.save(`Lavie_PhieuNhapKho_${purchase.purchaseNumber || purchase._id}.pdf`)
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }
  
  return (
    <div>
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium">
            Phiếu nhập kho: <span className="font-bold">{purchase.purchaseNumber || `PO-${purchase._id?.slice(-6)}`}</span>
          </h3>
          <p className="text-sm text-gray-500">
            <span className="mr-4">Ngày tạo: {formatDate(purchase.createdAt)}</span>
            {purchase.receivedDate && <span>Ngày nhận: {formatDate(purchase.receivedDate)}</span>}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={generatePDF}
          >
            <FaPrint className="mr-2" />
            In phiếu
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Nhà cung cấp</h4>
            <p className="font-medium">{purchase.supplier?.name}</p>
            {purchase.supplier?.contactPerson && <p className="text-sm">{purchase.supplier.contactPerson}</p>}
            {purchase.supplier?.phone && <p className="text-sm">{purchase.supplier.phone}</p>}
          </div>
          
          <div className="mt-4 md:mt-0">
            <h4 className="text-sm font-medium text-gray-500">Trạng thái</h4>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              purchase.status === 'received' ? 'bg-green-100 text-green-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {purchase.status === 'pending' ? 'Đang chờ' : 
              purchase.status === 'received' ? 'Đã nhận hàng' : 
              'Đã hủy'}
            </span>
          </div>
          
          <div className="mt-4 md:mt-0">
            <h4 className="text-sm font-medium text-gray-500">Tổng tiền</h4>
            <p className="font-medium">{formatCurrency(purchase.totalAmount)}</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn giá
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thành tiền
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchase.items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.product?.name || `Sản phẩm #${item.productId}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.product?.unit || 'Đơn vị'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium">
                Tổng cộng:
              </td>
              <td className="px-6 py-3 text-right text-sm font-bold">
                {formatCurrency(purchase.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Update Payment */}
      {(purchase.status === 'pending' || purchase.status === 'received') && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-3">Thanh toán</h3>
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền đã thanh toán
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                min="0"
                max={purchase.totalAmount}
              />
            </div>
            <div className="w-full md:w-1/3">
              <div className="mb-1 text-sm font-medium text-gray-700">
                Còn lại
              </div>
              <div className={`p-2 rounded-md ${
                purchase.totalAmount - paidAmount > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {formatCurrency(purchase.totalAmount - paidAmount)}
              </div>
            </div>
            <div className="w-full md:w-1/3 flex items-end">
              <button
                type="button"
                className="w-full p-2 text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50"
                onClick={handleUpdatePayment}
                disabled={isUpdating || paidAmount === purchase.paidAmount}
              >
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật thanh toán'}
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm">
            <div className="flex justify-between border-b pb-2 mb-2">
              <span>Tổng giá trị:</span>
              <span className="font-medium">{formatCurrency(purchase.totalAmount)}</span>
            </div>
            <div className="flex justify-between border-b pb-2 mb-2">
              <span>Đã thanh toán:</span>
              <span className="font-medium">{formatCurrency(purchase.paidAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Còn lại:</span>
              <span className="font-medium">{formatCurrency(purchase.totalAmount - purchase.paidAmount)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Notes */}
      {purchase.note && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-2">Ghi chú</h3>
          <p className="text-sm text-gray-600">{purchase.note}</p>
        </div>
      )}
    </div>
  )
}
