'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FaPlus, FaMinus, FaTrash, FaFileInvoice, FaSave, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { productService, Product } from '@/services/api/productService'
import { customerService, Customer } from '@/services/api/customerService'
import { orderService } from '@/services/api/orderService'

type OrderItem = {
  productId: string
  product: Product
  quantity: number
  price: number
  subtotal: number
}

export default function QuickOrderPage() {
  const router = useRouter()
  
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    type: 'retail',
  })
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [returnableContainers, setReturnableContainers] = useState<number>(0)
  const [note, setNote] = useState<string>('')
  
  // Load products and customers on component mount
  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])
  
  // Filter customers based on search term
  useEffect(() => {
    if (customerSearchTerm) {
      const filtered = customers.filter(
        customer => 
          customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
          (customer.phone && customer.phone.includes(customerSearchTerm))
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers([])
    }
  }, [customerSearchTerm, customers])
  
  // Calculate the total amount
  const totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0)
  const remainingAmount = totalAmount - paymentAmount
  
  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts()
      setProducts(data)
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error(`Lỗi khi tải danh sách sản phẩm: ${error.message || 'Unknown error'}`)
    }
  }
  
  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const data = await customerService.getCustomers()
      setCustomers(data)
    } catch (error: any) {
      console.error('Error fetching customers:', error)
      toast.error(`Lỗi khi tải danh sách khách hàng: ${error.message || 'Unknown error'}`)
    }
  }
  
  // Add product to order
  const addProductToOrder = (product: Product) => {
    const existingItemIndex = orderItems.findIndex(item => item.productId === product._id)
    
    if (existingItemIndex !== -1) {
      // Product already exists in order, increment quantity
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += 1
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price
      setOrderItems(updatedItems)
    } else {
      // Add new product to order
      setOrderItems([
        ...orderItems,
        {
          productId: product._id!,
          product,
          quantity: 1,
          price: product.price,
          subtotal: product.price
        }
      ])
    }
  }
  
  // Update quantity of an order item
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].subtotal = newQuantity * updatedItems[index].price
    setOrderItems(updatedItems)
  }
  
  // Remove item from order
  const removeItem = (index: number) => {
    const updatedItems = [...orderItems]
    updatedItems.splice(index, 1)
    setOrderItems(updatedItems)
  }
  
  // Handle customer selection
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearchTerm('')
    setShowCustomerDropdown(false)
  }
  
  // Create new customer
  const createNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Vui lòng nhập tên và số điện thoại của khách hàng')
      return
    }
    
    try {
      const createdCustomer = await customerService.createCustomer(newCustomer)
      setCustomers([...customers, createdCustomer])
      setSelectedCustomer(createdCustomer)
      setShowNewCustomerForm(false)
      setNewCustomer({
        name: '',
        phone: '',
        address: '',
        type: 'retail',
      })
      toast.success('Tạo khách hàng mới thành công!')
    } catch (error: any) {
      console.error('Error creating customer:', error)
      toast.error(`Lỗi khi tạo khách hàng mới: ${error.message || 'Unknown error'}`)
    }
  }
  
  // Create order and save to database
  const saveOrder = async () => {
    if (!selectedCustomer) {
      toast.error('Vui lòng chọn khách hàng')
      return
    }
    
    if (orderItems.length === 0) {
      toast.error('Vui lòng thêm sản phẩm vào đơn hàng')
      return
    }
    
    const orderData = {
      customerId: selectedCustomer._id!,
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      paidAmount: paymentAmount,
      returnableOut: orderItems.reduce((total, item) => {
        // Assuming each product has a returnable property
        const isReturnable = item.product.isReturnable
        return total + (isReturnable ? item.quantity : 0)
      }, 0),
      returnableIn: returnableContainers,
      status: 'completed', // Assuming quick orders are immediately completed
      note
    }
    
    try {
      const newOrder = await orderService.createOrder(orderData)
      toast.success('Tạo đơn hàng thành công!')
      
      // Generate invoice
      generateInvoice(newOrder)
      
      // Reset form
      setSelectedCustomer(null)
      setOrderItems([])
      setPaymentAmount(0)
      setReturnableContainers(0)
      setNote('')
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error(`Lỗi khi tạo đơn hàng: ${error.message || 'Unknown error'}`)
    }
  }
  
  // Generate PDF invoice
  const generateInvoice = (order: any) => {
    const doc = new jsPDF()
    
    // Add company info
    doc.setFontSize(20)
    doc.text('LAVIE WATER MANAGEMENT', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text('HÓA ĐƠN BÁN HÀNG', 105, 30, { align: 'center' })
    
    // Add order info
    doc.setFontSize(10)
    doc.text(`Mã đơn hàng: ${order._id}`, 14, 40)
    doc.text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 14, 45)
    doc.text(`Khách hàng: ${selectedCustomer?.name}`, 14, 50)
    doc.text(`Số điện thoại: ${selectedCustomer?.phone}`, 14, 55)
    doc.text(`Địa chỉ: ${selectedCustomer?.address || 'N/A'}`, 14, 60)
    
    // Add order items table
    autoTable(doc, {
      startY: 70,
      head: [['STT', 'Sản phẩm', 'Đơn giá', 'Số lượng', 'Thành tiền']],
      body: orderItems.map((item, index) => [
        index + 1,
        item.product.name,
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price),
        item.quantity,
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)
      ]),
      foot: [
        ['', '', '', 'Tổng tiền:', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)],
        ['', '', '', 'Đã thanh toán:', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentAmount)],
        ['', '', '', 'Còn lại:', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remainingAmount)]
      ],
      theme: 'striped',
      headStyles: { fillColor: [28, 102, 161] },
      footStyles: { fillColor: [239, 246, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
    })
    
    // Add returnable containers info
    const tableEndY = (doc as any).lastAutoTable.finalY + 10
    doc.text(`Số vỏ mang đi: ${orderItems.reduce((total, item) => {
      return total + (item.product.isReturnable ? item.quantity : 0)
    }, 0)}`, 14, tableEndY)
    doc.text(`Số vỏ trả lại: ${returnableContainers}`, 14, tableEndY + 5)
    
    // Add note
    if (note) {
      doc.text(`Ghi chú: ${note}`, 14, tableEndY + 15)
    }
    
    // Add signature areas
    doc.text('Người mua hàng', 40, tableEndY + 30, { align: 'center' })
    doc.text('(Ký, ghi rõ họ tên)', 40, tableEndY + 35, { align: 'center' })
    
    doc.text('Người bán hàng', 160, tableEndY + 30, { align: 'center' })
    doc.text('(Ký, ghi rõ họ tên)', 160, tableEndY + 35, { align: 'center' })
    
    // Save the PDF
    doc.save(`Lavie_HoaDon_${order._id}.pdf`)
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Customer selection and product list */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Tạo đơn hàng nhanh</h2>
          
          {/* Customer selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khách hàng
            </label>
            
            {selectedCustomer ? (
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{selectedCustomer.name}</div>
                    <div className="text-sm text-gray-600">
                      {selectedCustomer.phone && (
                        <div className="flex items-center mt-1">
                          <FaPhone className="mr-2 text-gray-400" size={14} />
                          {selectedCustomer.phone}
                        </div>
                      )}
                      {selectedCustomer.address && (
                        <div className="flex items-center mt-1">
                          <FaMapMarkerAlt className="mr-2 text-gray-400" size={14} />
                          {selectedCustomer.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tìm khách hàng theo tên hoặc số điện thoại"
                    value={customerSearchTerm}
                    onChange={(e) => {
                      setCustomerSearchTerm(e.target.value)
                      setShowCustomerDropdown(true)
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <FaUser className="text-gray-400" />
                  </div>
                </div>
                
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {customerSearchTerm && filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-gray-500">Không tìm thấy khách hàng</p>
                        <button
                          className="mt-2 text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setShowNewCustomerForm(true)
                            setShowCustomerDropdown(false)
                            setNewCustomer({
                              ...newCustomer,
                              name: customerSearchTerm,
                            })
                          }}
                        >
                          + Tạo khách hàng mới
                        </button>
                      </div>
                    ) : (
                      <>
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer._id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => selectCustomer(customer)}
                          >
                            <div className="font-medium">{customer.name}</div>
                            {customer.phone && (
                              <div className="text-sm text-gray-600">
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="p-2 border-t">
                          <button
                            className="w-full p-2 text-center text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setShowNewCustomerForm(true)
                              setShowCustomerDropdown(false)
                              setNewCustomer({
                                ...newCustomer,
                                name: customerSearchTerm,
                              })
                            }}
                          >
                            + Tạo khách hàng mới
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {showNewCustomerForm && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md">
                <h3 className="text-lg font-medium mb-3">Tạo khách hàng mới</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên khách hàng *
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại khách hàng
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={newCustomer.type}
                      onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value })}
                    >
                      <option value="retail">Khách lẻ</option>
                      <option value="agency">Đại lý</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={() => {
                        setShowNewCustomerForm(false)
                        setNewCustomer({
                          name: '',
                          phone: '',
                          address: '',
                          type: 'retail',
                        })
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={createNewCustomer}
                    >
                      Tạo khách hàng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Product list */}
          <div>
            <h3 className="text-lg font-medium mb-3">Danh sách sản phẩm</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-200 rounded-md p-3 hover:shadow-md cursor-pointer transition"
                  onClick={() => addProductToOrder(product)}
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    {product.unit} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order details */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h2>
          
          {orderItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có sản phẩm nào trong đơn hàng
            </div>
          ) : (
            <div className="mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
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
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                          <div className="text-sm text-gray-500">{item.product.unit}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          <div className="flex items-center justify-end">
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                            >
                              <FaMinus size={12} />
                            </button>
                            <span className="mx-2">{item.quantity}</span>
                            <button
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
                            className="text-red-600 hover:text-red-800"
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
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium">
                        Tổng tiền:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
          
          {/* Payment and returnable containers */}
          {orderItems.length > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền thanh toán
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                />
                <div className="mt-1 text-sm text-gray-500 flex justify-between">
                  <span>Còn lại:</span>
                  <span className={remainingAmount > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remainingAmount)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số vỏ trả lại
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={returnableContainers}
                  onChange={(e) => setReturnableContainers(Number(e.target.value))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
                  onClick={saveOrder}
                  disabled={!selectedCustomer || orderItems.length === 0}
                >
                  <FaSave className="mr-2" />
                  Lưu đơn hàng
                </button>
                
                <button
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
                  onClick={() => {
                    if (!selectedCustomer) {
                      toast.error('Vui lòng chọn khách hàng')
                      return
                    }
                    
                    if (orderItems.length === 0) {
                      toast.error('Vui lòng thêm sản phẩm vào đơn hàng')
                      return
                    }
                    
                    // Generate temporary invoice without saving
                    const tempOrder = {
                      _id: 'TEMP' + new Date().getTime()
                    }
                    generateInvoice(tempOrder)
                  }}
                  disabled={!selectedCustomer || orderItems.length === 0}
                >
                  <FaFileInvoice className="mr-2" />
                  Xuất hóa đơn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
