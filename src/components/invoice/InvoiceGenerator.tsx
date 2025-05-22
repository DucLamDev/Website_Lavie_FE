'use client'

import { useState } from 'react'
import { Order, OrderItem } from '@/services/api/orderService'
import { saveInvoicePDF, printInvoicePDF } from '@/utils/pdfUtils'
import { FaFileInvoice, FaPrint, FaTimes } from 'react-icons/fa'

type InvoiceGeneratorProps = {
  order: Order
  orderItems: OrderItem[]
  onCloseAction: () => void
}

export default function InvoiceGenerator({ order, orderItems, onCloseAction }: InvoiceGeneratorProps) {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Lavie Water',
    address: 'Địa chỉ: Khánh Hòa, Việt Nam',
    phone: 'Điện thoại: 0123456789',
    email: 'Email: contact@laviewater.com',
    taxId: 'Mã số thuế: 0123456789',
  })

  const [additionalInfo, setAdditionalInfo] = useState('')

  const handleSaveInvoice = () => {
    saveInvoicePDF(order, orderItems, { ...companyInfo, additionalInfo })
  }

  const handlePrintInvoice = () => {
    printInvoicePDF(order, orderItems, { ...companyInfo, additionalInfo })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo hóa đơn</h2>
          <button
            onClick={onCloseAction}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên công ty
            </label>
            <input
              type="text"
              className="input w-full"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Địa chỉ
            </label>
            <input
              type="text"
              className="input w-full"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Điện thoại
              </label>
              <input
                type="text"
                className="input w-full"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="text"
                className="input w-full"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mã số thuế
            </label>
            <input
              type="text"
              className="input w-full"
              value={companyInfo.taxId}
              onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thông tin bổ sung
            </label>
            <textarea
              className="input w-full h-24"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Nhập thông tin bổ sung cho hóa đơn (nếu có)"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Thông tin đơn hàng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng:</p>
                <p className="font-medium">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Khách hàng:</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng tiền:</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Đã thanh toán:</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.paidAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCloseAction}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn btn-success flex items-center"
            onClick={handleSaveInvoice}
          >
            <FaFileInvoice className="mr-2" />
            Tải hóa đơn PDF
          </button>
          <button
            type="button"
            className="btn btn-primary flex items-center"
            onClick={handlePrintInvoice}
          >
            <FaPrint className="mr-2" />
            In hóa đơn
          </button>
        </div>
      </div>
    </div>
  )
}
