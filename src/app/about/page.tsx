'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaWater, FaLeaf, FaAward, FaHistory, FaIndustry, FaHandHoldingWater } from 'react-icons/fa'

export default function AboutPage() {
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
              Giới thiệu về Lavie
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Nguồn nước tinh khiết từ thiên nhiên, mang đến sức khỏe và sự tươi mới cho mọi gia đình Việt Nam.
            </p>
          </div>
        </div>
      </div>
      
      {/* Our Story Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Câu chuyện của chúng tôi</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Hành trình của Lavie
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Lavie - thương hiệu nước khoáng thiên nhiên hàng đầu Việt Nam, đã đồng hành cùng người Việt trong hơn 25 năm qua.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="space-y-16">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="lg:w-1/2 lg:pr-8">
                  <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-primary-100 flex items-center justify-center">
                      <FaHistory className="h-24 w-24 text-primary-300" />
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 mt-8 lg:mt-0 lg:pl-8">
                  <h3 className="text-2xl font-bold text-gray-900">Lịch sử hình thành</h3>
                  <p className="mt-4 text-lg text-gray-600">
                    Lavie được thành lập vào năm 1993, với nguồn nước khoáng thiên nhiên được khai thác từ vùng núi cao nguyên 
                    Lâm Đồng. Trải qua hơn 25 năm phát triển, Lavie đã trở thành thương hiệu nước khoáng uy tín và được 
                    tin dùng bởi hàng triệu gia đình Việt Nam.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row-reverse items-center">
                <div className="lg:w-1/2 lg:pl-8">
                  <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-primary-100 flex items-center justify-center">
                      <FaIndustry className="h-24 w-24 text-primary-300" />
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 mt-8 lg:mt-0 lg:pr-8">
                  <h3 className="text-2xl font-bold text-gray-900">Quy trình sản xuất</h3>
                  <p className="mt-4 text-lg text-gray-600">
                    Nước khoáng Lavie được khai thác từ nguồn nước ngầm tự nhiên, trải qua quy trình lọc tiên tiến 
                    theo tiêu chuẩn châu Âu. Mỗi giọt nước Lavie đều được kiểm soát nghiêm ngặt về chất lượng, 
                    đảm bảo giữ nguyên các khoáng chất có lợi cho sức khỏe.
                  </p>
                </div>
              </div>
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
                        <FaAward className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Chất lượng</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Đạt tiêu chuẩn an toàn vệ sinh thực phẩm quốc tế, được kiểm định nghiêm ngặt từ nguồn nước 
                      đến quy trình đóng chai và phân phối.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Products Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Sản phẩm của chúng tôi</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Đa dạng sản phẩm
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Lavie cung cấp nhiều dòng sản phẩm nước khoáng với các dung tích khác nhau, đáp ứng nhu cầu sử dụng đa dạng.
            </p>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
              Xem tất cả sản phẩm
            </Link>
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
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
