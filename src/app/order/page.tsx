'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaShoppingCart, FaPlus, FaMinus, FaTrash, FaSignInAlt } from 'react-icons/fa'
import { productService } from '@/services/api/productService'
import { orderService } from '@/services/api/orderService'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

type Product = {
  _id: string
  name: string
  unit: string
  price: number
  is_returnable: boolean
  description?: string
  image_url?: string
}

type CartItem = {
  product: Product
  quantity: number
  returnable_quantity?: number
}

function OrderContent() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: ''
  })
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await productService.getProducts()
      setProducts(data)
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error(`Lỗi khi tải sản phẩm: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product._id === product._id)
      
      if (existingItem) {
        return prevCart.map(item => 
          item.product._id === product._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      } else {
        return [...prevCart, { product, quantity: 1 }]
      }
    })
    
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId)
      return
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product._id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    )
  }

  const handleUpdateReturnableQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product._id === productId 
          ? { ...item, returnable_quantity: newQuantity } 
          : item
      )
    )
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product._id !== productId))
    toast.info('Đã xóa sản phẩm khỏi giỏ hàng')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({ ...prev, [name]: value }))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      // Tính tiền sản phẩm
      const productTotal = item.product.price * item.quantity
      
      // Trừ tiền hoàn trả vỏ bình (nếu có)
      const returnableDiscount = item.product.is_returnable && item.returnable_quantity 
        ? item.returnable_quantity * 6500 // Giá vỏ bình cố định là 6,500đ
        : 0
        
      return total + productTotal - returnableDiscount
    }, 0)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      toast.error('Vui lòng thêm sản phẩm vào giỏ hàng')
      return
    }
    
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email || '',
          address: customerInfo.address
        },
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          returnable_quantity: item.returnable_quantity || 0,
          price: item.product.price
        })),
        note: customerInfo.note || '',
        status: 'pending',
        totalAmount: calculateTotal()
      }
      
      // Gọi API để tạo đơn hàng
      try {
        const response = await orderService.createOrder(orderData)
        setOrderNumber(response._id) // Sử dụng ID của đơn hàng thay vì order_number
        setOrderSuccess(true)
        
        // Xóa giỏ hàng
        setCart([])
        // Reset thông tin khách hàng
        setCustomerInfo({
          name: '',
          phone: '',
          email: '',
          address: '',
          note: ''
        })
        
        toast.success('Đặt hàng thành công!')
      } catch (error: any) {
        toast.error(`Lỗi khi đặt hàng: ${error.message || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error(`Lỗi khi đặt hàng: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là:</p>
            <div className="bg-gray-100 py-3 px-4 rounded-lg text-xl font-mono font-bold text-primary-600 mb-6">
              {orderNumber}
            </div>
            <p className="text-gray-600 mb-8">
              Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng. 
              Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua số hotline: <span className="font-semibold">1900 1234</span>
            </p>
            <button 
              onClick={() => setOrderSuccess(false)} 
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Đặt hàng mới
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Đặt hàng trực tuyến</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map(product => (
                  <div key={product._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                      {product.image_url ? (
                        <Image 
                          src={product.image_url} 
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">Không có hình ảnh</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-gray-500 text-sm mb-2">{product.unit}</p>
                      {product.description && (
                        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary-600">{formatCurrency(product.price)}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-primary-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-primary-700 transition-colors"
                        >
                          <FaPlus size={12} />
                          <span>Thêm</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Giỏ hàng và thông tin khách hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaShoppingCart className="text-primary-600" />
              <span>Giỏ hàng của bạn</span>
            </h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Giỏ hàng của bạn đang trống</p>
                <p className="text-sm mt-2">Vui lòng chọn sản phẩm</p>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {cart.map(item => (
                    <div key={item.product._id} className="py-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{item.product.name}</span>
                        <button 
                          onClick={() => handleRemoveFromCart(item.product._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 text-sm">{formatCurrency(item.product.price)} × {item.quantity}</span>
                        <div className="flex items-center border rounded-md">
                          <button 
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </div>
                      
                      {item.product.is_returnable && (
                        <div className="mt-2 bg-blue-50 p-2 rounded-md">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700">Hoàn trả vỏ bình:</span>
                            <div className="flex items-center border rounded-md bg-white">
                              <button 
                                onClick={() => handleUpdateReturnableQuantity(item.product._id, (item.returnable_quantity || 0) - 1)}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                <FaMinus size={10} />
                              </button>
                              <span className="px-3 py-1">{item.returnable_quantity || 0}</span>
                              <button 
                                onClick={() => handleUpdateReturnableQuantity(item.product._id, (item.returnable_quantity || 0) + 1)}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                <FaPlus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold text-lg mb-6">
                    <span>Tổng cộng:</span>
                    <span className="text-primary-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                  
                  <form onSubmit={handleSubmitOrder}>
                    <h3 className="font-semibold mb-3">Thông tin giao hàng</h3>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={customerInfo.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={customerInfo.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng *</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={customerInfo.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea
                          id="note"
                          name="note"
                          value={customerInfo.note}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderPage() {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Bạn cần đăng nhập
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Vui lòng đăng nhập để tiếp tục đặt hàng
            </p>
          </div>
          <div className="mt-8">
            <Link 
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
            >
              <FaSignInAlt className="mr-2" />
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <ProtectedRoute allowedRoles={['admin', 'sales', 'delivery']}>
      <OrderContent />
    </ProtectedRoute>
  )
}
