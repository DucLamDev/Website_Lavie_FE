'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { inventoryService, Purchase, PurchaseItem } from '@/services/api/inventoryService'
import { productService, Product } from '@/services/api/productService'
import { supplierService, Supplier } from '@/services/api/supplierService'

type NewPurchaseFormProps = {
  onPurchaseCreatedAction: (purchase: Purchase) => void
  onCancelAction: () => void
}

export default function NewPurchaseForm({ onPurchaseCreatedAction, onCancelAction }: NewPurchaseFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [note, setNote] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Calculate total amount
  const totalAmount = purchaseItems.reduce((total, item) => total + item.subtotal, 0)
  
  useEffect(() => {
    fetchSuppliers()
    fetchProducts()
  }, [])
  
  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getSuppliers()
      setSuppliers(data)
    } catch (error: any) {
      console.error('Error fetching suppliers:', error)
      toast.error(`Lỗi khi tải danh sách nhà cung cấp: ${error.message || 'Unknown error'}`)
    }
  }
  
  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts()
      setProducts(data)
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error(`Lỗi khi tải danh sách sản phẩm: ${error.message || 'Unknown error'}`)
    }
  }
  
  const addProductToPurchase = (productId: string) => {
    const product = products.find(p => p._id === productId)
    if (!product) return
    
    const existingItemIndex = purchaseItems.findIndex(item => item.productId === productId)
    
    if (existingItemIndex !== -1) {
      // Product already exists in purchase, increment quantity
      const updatedItems = [...purchaseItems]
      updatedItems[existingItemIndex].quantity += 1
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price
      setPurchaseItems(updatedItems)
    } else {
      // Add new product to purchase
      setPurchaseItems([
        ...purchaseItems,
        {
          productId,
          quantity: 1,
          price: product.price,
          subtotal: product.price,
          product
        }
      ])
    }
  }
  
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    const updatedItems = [...purchaseItems]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].subtotal = newQuantity * updatedItems[index].price
    setPurchaseItems(updatedItems)
  }
  
  const updatePrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return
    
    const updatedItems = [...purchaseItems]
    updatedItems[index].price = newPrice
    updatedItems[index].subtotal = updatedItems[index].quantity * newPrice
    setPurchaseItems(updatedItems)
  }
  
  const removeItem = (index: number) => {
    const updatedItems = [...purchaseItems]
    updatedItems.splice(index, 1)
    setPurchaseItems(updatedItems)
  }
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!selectedSupplierId) {
      toast.error('Vui lòng chọn nhà cung cấp')
      return
    }
    
    if (purchaseItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm')
      return
    }
    
    const purchaseData: Omit<Purchase, '_id'> = {
      supplierId: selectedSupplierId,
      items: purchaseItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      totalAmount,
      paidAmount,
      status: 'pending',
      note
    }
    
    setIsLoading(true)
    
    try {
      const response = await inventoryService.createPurchase(purchaseData)
      onPurchaseCreatedAction(response)
    } catch (error: any) {
      console.error('Error creating purchase:', error)
      toast.error(`Lỗi khi tạo đơn nhập hàng: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhà cung cấp <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            required
          >
            <option value="">-- Chọn nhà cung cấp --</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Payment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền thanh toán (VNĐ)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
            min="0"
          />
          
          {totalAmount > 0 && (
            <div className="mt-1 text-sm flex justify-between">
              <span>Tổng tiền:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </span>
            </div>
          )}
          
          {totalAmount > 0 && (
            <div className="mt-1 text-sm flex justify-between">
              <span>Còn lại:</span>
              <span className={`font-medium ${totalAmount - paidAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount - paidAmount)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Selection */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chọn sản phẩm để thêm vào đơn <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          onChange={(e) => addProductToPurchase(e.target.value)}
          value=""
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)} / {product.unit}
            </option>
          ))}
        </select>
      </div>
      
      {/* Purchase Items Table */}
      {purchaseItems.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Danh sách sản phẩm</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá nhập (VNĐ)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành tiền
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product?.name || `Sản phẩm #${item.productId}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.product?.unit || 'Đơn vị'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        className="w-24 p-1 text-right border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        value={item.price}
                        onChange={(e) => updatePrice(index, Number(e.target.value))}
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                        >
                          <FaMinus size={12} />
                        </button>
                        <input
                          type="number"
                          className="w-16 mx-2 p-1 text-center border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(index, Number(e.target.value))}
                          min="1"
                        />
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => removeItem(index)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium">
                    Tổng cộng:
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      
      {/* Note */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>
      
      {/* Form Actions */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          onClick={onCancelAction}
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          disabled={isLoading || !selectedSupplierId || purchaseItems.length === 0}
        >
          {isLoading ? 'Đang xử lý...' : 'Tạo đơn nhập hàng'}
        </button>
      </div>
    </form>
  )
}
