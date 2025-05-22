'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaWater, FaLeaf, FaShoppingCart, FaInfoCircle, FaPhone } from 'react-icons/fa'
import { productService, Product } from '@/services/api/productService'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchFeaturedProducts()
  }, [])
  
  const fetchFeaturedProducts = async () => {
    setIsLoading(true)
    
    try {
      const data = await productService.getProducts()
      // Get only 4 products for featured section
      setFeaturedProducts(data.slice(0, 4))
    } catch (error) {
      console.error('Error fetching featured products:', error)
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
        
        <div className="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Lavie Water
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Nguồn nước tinh khiết từ thiên nhiên, mang đến sức khỏe và sự tươi mới cho mọi gia đình Việt Nam.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-800 bg-white hover:bg-gray-100">
                Xem sản phẩm
                <FaShoppingCart className="ml-2" />
              </Link>
              <Link href="/about" className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-900 hover:bg-primary-950">
                Giới thiệu
                <FaInfoCircle className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Products Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Sản phẩm nổi bật</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Nước khoáng tinh khiết Lavie
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Khám phá các sản phẩm nước khoáng Lavie chất lượng cao, đáp ứng mọi nhu cầu sử dụng.
            </p>
          </div>
          
          <div className="mt-12">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <div key={product._id} className="group relative">
                    <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
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
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Link href="/products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Xem tất cả sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Why Choose Us Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Tại sao chọn Lavie</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Cam kết chất lượng
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Chúng tôi cam kết mang đến nguồn nước tinh khiết, an toàn và giàu khoáng chất cho mọi gia đình.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg h-full">
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
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <FaLeaf className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Tự nhiên</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Nguồn nước khoáng thiên nhiên, giàu khoáng chất có lợi cho sức khỏe như canxi, magie, kali và 
                      nhiều nguyên tố vi lượng khác.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg h-full">
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
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact CTA */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Bạn cần đặt nước?</span>
            <span className="block text-primary-200">Liên hệ với chúng tôi ngay hôm nay.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/order" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50">
                Đặt hàng ngay
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/contact" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-800 hover:bg-primary-900">
                Liên hệ
                <FaPhone className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
