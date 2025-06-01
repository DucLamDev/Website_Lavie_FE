'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa'
import { customerService, Customer } from '@/services/api/customerService'
import { productService, Product } from '@/services/api/productService'
import { orderService, Order, OrderCreate } from '@/services/api/orderService'
import { toast } from 'react-toastify'
import { getUsers, User } from '@/services/api/userService'

type OrderItem = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
  is_returnable: boolean
}

type NewOrderFormProps = {
  onOrderCreatedAction: (order: Order) => void
  onCancelAction: () => void
}

export default function NewOrderForm({ onOrderCreatedAction, onCancelAction }: NewOrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paidAmount, setPaidAmount] = useState(0)
  const [isFormValid, setIsFormValid] = useState(false)
  
  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])
  
  useEffect(() => {
    // Validate form: must have customer and at least one item
    setIsFormValid(!!selectedCustomer && orderItems.length > 0)
  }, [selectedCustomer, orderItems])
  
  const fetchCustomers = async () => {
    setIsLoadingCustomers(true)
    try {
      const users: User[] = await getUsers()
      const customers = users.filter(u => u.role === 'customer')
      // Map user -> Customer FE
      setCustomers(customers.map(u => ({
        _id: u._id,
        name: u.name,
        type: 'retail', // hoặc lấy từ user nếu có
        phone: u.username, // hoặc lấy trường phone nếu có
        address: '', // hoặc lấy trường address nếu có
        agency_level: undefined,
        debt: 0,
        empty_debt: 0,
        createdAt: u.createdAt || '',
        updatedAt: u.updatedAt || ''
      })))
    } catch (error: any) {
      console.error('Error fetching customers:', error)
      toast.error(`Lỗi khi tải danh sách khách hàng: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoadingCustomers(false)
    }
  }
  
  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    
    try {
      const data = await productService.getProducts()
      console.log('Products fetched:', data)
      setProducts(data)
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error(`Lỗi khi tải danh sách sản phẩm: ${error.message || 'Unknown error'}`)
      // Không sử dụng dữ liệu mẫu nữa, để tránh việc tạo đơn hàng với dữ liệu không thật
    } finally {
      setIsLoadingProducts(false)
    }
  }
  
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearchTerm('')
  }
  
  const addProductToOrder = (product: Product) => {
    // Check if product already in order
    const existingItemIndex = orderItems.findIndex(item => item.productId === product._id)
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const newOrderItems = [...orderItems]
      const item = newOrderItems[existingItemIndex]
      item.quantity += 1
      item.total = item.quantity * item.unitPrice
      setOrderItems(newOrderItems)
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          productId: product._id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          total: product.price,
          is_returnable: product.is_returnable
        }
      ])
    }
    
    setProductSearchTerm('')
  }
  
  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    
    const newOrderItems = [...orderItems]
    newOrderItems[index].quantity = quantity
    newOrderItems[index].total = quantity * newOrderItems[index].unitPrice
    setOrderItems(newOrderItems)
  }
  
  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }
  
  const calculateTotalAmount = () => {
    // Tính tổng tiền sản phẩm
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }
  
  // Tính tiền cọc vỏ bình (mỗi vỏ bình cọc 50.000đ)
  const calculateDepositAmount = () => {
    return calculateTotalReturnable() * 50000
  }
  
  // Tính tổng tiền phải thanh toán (bao gồm cả tiền cọc vỏ bình)
  const calculateTotalPayment = () => {
    return calculateTotalAmount() + calculateDepositAmount()
  }
  
  const calculateTotalReturnable = () => {
    return orderItems.reduce((sum, item) => 
      item.is_returnable ? sum + item.quantity : sum, 0)
  }
  
  const handleCreateOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      toast.error('Vui lòng chọn khách hàng và thêm sản phẩm vào đơn hàng')
      return
    }
    
    // Kiểm tra số lượng tồn kho trước khi tạo đơn hàng
    for (const item of orderItems) {
      const product = products.find(p => p._id === item.productId)
      if (!product) {
        toast.error(`Không tìm thấy sản phẩm ${item.productName}`)
        return
      }
      
      if (product.stock < item.quantity) {
        toast.error(`Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho, không đủ ${item.quantity}`)
        return
      }
    }
    
    try {
      // Prepare order data for API
      const orderData: OrderCreate = {
        customerId: selectedCustomer._id,
        orderItems: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0, // Đảm bảo unitPrice luôn có giá trị
          total: item.total // Sử dụng total đã được tính sẵn trong orderItems
        })),
        paidAmount: paidAmount || 0,
        totalAmount: calculateTotalAmount(),
        depositAmount: calculateDepositAmount(),
        totalPayment: calculateTotalPayment()
      }
      
      console.log('Sending order data to API:', JSON.stringify(orderData, null, 2))
      
      // Hiển thị thông báo đang xử lý
      toast.info('Đang tạo đơn hàng...')
      
      try {
        // Call API to create order
        const newOrder = await orderService.createOrder(orderData)
        console.log('Order created successfully:', newOrder)
        
        toast.success('Đơn hàng đã được tạo thành công!')
        onOrderCreatedAction(newOrder)
      } catch (error: any) {
        // Kiểm tra nếu đơn hàng đã được tạo nhưng vẫn báo lỗi
        console.error('Error in order creation response:', error)
        
        // Nếu có lỗi nhưng đơn hàng vẫn được tạo, refresh lại danh sách
        if (error.response && error.response.data && error.response.data.message && 
            error.response.data.message.includes('OrderItem validation failed')) {
          toast.warning('Đơn hàng đã được tạo nhưng có lỗi xảy ra. Đang làm mới danh sách...')
          // Đóng form và báo thành công để refresh danh sách
          onOrderCreatedAction({
            _id: 'refresh-needed',
            customerId: selectedCustomer._id,
            customerName: selectedCustomer.name,
            orderDate: new Date().toISOString(),
            status: 'pending',
            totalAmount: calculateTotalAmount(),
            paidAmount: paidAmount || 0,
            debtRemaining: calculateTotalAmount() - (paidAmount || 0),
            returnableOut: calculateTotalReturnable(),
            returnableIn: 0,
            createdBy: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        } else {
          // Nếu là lỗi khác, hiển thị thông báo lỗi
          throw error
        }
      }
    } catch (error: any) {
      console.error('Error creating order:', error)
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response) {
        // Lỗi từ server với response
        console.error('Server error response:', error.response.data)
        toast.error(`Lỗi từ server: ${error.response.data.message || error.response.statusText || 'Unknown error'}`)
      } else if (error.request) {
        // Lỗi không nhận được response
        console.error('No response received:', error.request)
        toast.error('Không nhận được phản hồi từ server, vui lòng kiểm tra kết nối mạng')
      } else {
        // Lỗi khác
        toast.error(`Lỗi khi tạo đơn hàng: ${error.message || 'Unknown error'}`)
      }
    }
  }
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.includes(customerSearchTerm)
  )
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">1. Chọn khách hàng</h3>
        
        {selectedCustomer ? (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{selectedCustomer.name}</h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>{selectedCustomer.phone}</p>
                  <p>{selectedCustomer.address}</p>
                  <p className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedCustomer.type === 'agency'
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {selectedCustomer.type === 'agency' 
                        ? `Đại lý cấp ${selectedCustomer.agency_level}` 
                        : 'Khách lẻ'
                      }
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Công nợ hiện tại: 
                  <span className={selectedCustomer.debt > 0 ? 'text-red-500 ml-1' : 'ml-1'}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCustomer.debt)}
                  </span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vỏ nợ hiện tại: 
                  <span className={selectedCustomer.empty_debt > 0 ? 'text-amber-500 ml-1' : 'ml-1'}>
                    {selectedCustomer.empty_debt} vỏ
                  </span>
                </p>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Chọn khách hàng khác
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative w-full mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Tìm kiếm theo tên, số điện thoại..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600">
              {isLoadingCustomers ? (
                <div className="flex justify-center items-center h-full">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
                </div>
              ) : filteredCustomers.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCustomers.map((customer) => (
                    <li 
                      key={customer._id}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => selectCustomer(customer)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            customer.type === 'agency'
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {customer.type === 'agency' 
                              ? `Đại lý cấp ${customer.agency_level}` 
                              : 'Khách lẻ'
                            }
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                  Không tìm thấy khách hàng
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Product Selection */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">2. Thêm sản phẩm</h3>
        
        <div className="relative w-full mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Tìm kiếm sản phẩm..."
            value={productSearchTerm}
            onChange={(e) => setProductSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="mb-4 h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600">
          {isLoadingProducts ? (
            <div className="flex justify-center items-center h-full">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <li 
                  key={product._id}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => addProductToOrder(product)}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.is_returnable ? 'Có vỏ hoàn trả' : 'Không hoàn trả'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Tồn: {product.stock}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
              Không tìm thấy sản phẩm
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số lượng</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Đơn giá</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thành tiền</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.productName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.is_returnable ? 'Có vỏ hoàn trả' : 'Không hoàn trả'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          onClick={() => updateItemQuantity(index, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="input mx-2 w-16 text-center"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                        />
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          onClick={() => updateItemQuantity(index, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Chưa có sản phẩm nào. Tìm kiếm và chọn sản phẩm để thêm vào đơn hàng.
                  </td>
                </tr>
              )}
              
              {orderItems.length > 0 && (
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                    Tổng cộng:
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotalAmount())}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Payment Information */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">3. Thông tin thanh toán</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="paidAmount" className="label">Số tiền thanh toán</label>
            <input
              type="number"
              id="paidAmount"
              className="input"
              placeholder="Nhập số tiền khách thanh toán"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              max={calculateTotalPayment()}
            />
          </div>
          
          <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600">
            <span className="font-medium text-gray-900 dark:text-white">Tổng tiền hàng:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotalAmount())}
            </span>
          </div>
          
          {calculateTotalReturnable() > 0 && (
            <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600">
              <span className="font-medium text-gray-900 dark:text-white">Tiền cọc vỏ bình:</span>
              <span className="font-bold text-amber-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateDepositAmount())}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-900">
            <span className="font-medium text-gray-900 dark:text-white">Tổng thanh toán:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotalPayment())}
            </span>
          </div>
          
          <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600">
            <span className="font-medium text-gray-900 dark:text-white">Thanh toán:</span>
            <span className="font-bold text-green-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paidAmount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600">
            <span className="font-medium text-gray-900 dark:text-white">Còn lại:</span>
            <span className={`font-bold ${paidAmount < calculateTotalPayment() ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotalPayment() - paidAmount)}
            </span>
          </div>
          
          {calculateTotalReturnable() > 0 && (
            <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600">
              <span className="font-medium text-gray-900 dark:text-white">Vỏ xuất:</span>
              <span className="font-bold text-amber-600">{calculateTotalReturnable()} vỏ</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancelAction}
        >
          Hủy bỏ
        </button>
        
        <button
          type="button"
          className="btn btn-primary"
          disabled={!isFormValid}
          onClick={handleCreateOrder}
        >
          Tạo đơn hàng
        </button>
      </div>
    </div>
  )
}
