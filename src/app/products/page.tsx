'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaWater, FaArrowRight, FaPhone, FaShoppingCart } from 'react-icons/fa'
import { productService, Product } from '@/services/api/productService'
import { toast } from 'react-toastify'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
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
      toast.error(`Lỗi khi tải danh sách sản phẩm: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/images/lavie-default.jpg';
    e.currentTarget.onerror = null; // Prevent infinite loop if default image also fails
  }
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-800 to-primary-600 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-primary-900 opacity-30"></div>
          <div className="absolute inset-0 bg-grid-white/5"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Nước uống tinh khiết Lavie
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Sức khỏe từ nguồn nước tự nhiên, tinh khiết và an toàn cho cả gia đình bạn.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/contact" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-800 bg-white hover:bg-gray-100">
                Liên hệ đặt hàng
                <FaPhone className="ml-2" />
              </Link>
              <Link href="#products" className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-900 hover:bg-primary-950">
                Xem sản phẩm
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* About Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Về Lavie</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Nguồn nước tinh khiết, tiêu chuẩn châu Âu
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Lavie - thương hiệu nước tinh khiết hàng đầu Việt Nam, mang đến cho bạn và gia đình nguồn nước tinh khiết, 
              đạt tiêu chuẩn châu Âu, giúp bảo vệ sức khỏe mỗi ngày.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <FaWater className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Tinh khiết</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Nước Lavie được lọc qua hệ thống lọc hiện đại, đảm bảo loại bỏ tạp chất và vi khuẩn, 
                      mang đến nguồn nước tinh khiết nhất.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">An toàn</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Đạt tiêu chuẩn an toàn vệ sinh thực phẩm, được kiểm định nghiêm ngặt từ nguồn nước đến quy trình 
                      đóng chai và phân phối.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Toàn quốc</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Sản phẩm Lavie được phân phối rộng khắp toàn quốc, dễ dàng tìm mua tại các cửa hàng, siêu thị 
                      và đại lý chính hãng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Section */}
      <div id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Các sản phẩm Lavie
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <div key={product._id} className="group relative">
                  <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden">
                    <div className="relative h-full w-full">
                      {product.image ? (
                        <Image 
                          src={product.image} 
                          alt={product.name}
                          fill
                          style={{ objectFit: 'contain' }}
                          onError={handleImageError}
                          className="p-4"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaWater className="h-20 w-20 text-primary-500 opacity-20" />
                          <div className="p-4 flex items-center justify-center h-full">
                            <div className="text-center">
                              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">Đơn vị: {product.unit}</p>
                    </div>
                    <p className="text-lg font-medium text-primary-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href="/order" className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                      <FaShoppingCart className="mr-2" />
                      Đặt hàng
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Sẵn sàng đặt hàng?</span>
            <span className="block text-primary-200">Liên hệ với chúng tôi ngay hôm nay.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/contact" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50">
                Liên hệ đặt hàng
                <FaPhone className="ml-2" />
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/dashboard" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-900 hover:bg-primary-950">
                Đăng nhập
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
