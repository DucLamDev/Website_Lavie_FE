'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram } from 'react-icons/fa'

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  type: 'question' | 'order' | 'feedback' | 'other'
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    type: 'question'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // In a real application, this would connect to the backend API
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // if (!response.ok) throw new Error('Failed to send message')
      
      setSubmitted(true)
      toast.success('Gửi thông tin liên hệ thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        type: 'question'
      })
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error('Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Liên hệ với chúng tôi
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Hãy để lại thông tin và chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Contact information */}
            <div className="relative overflow-hidden py-10 px-6 bg-primary-700 sm:px-10 xl:p-12">
              <div className="absolute inset-0 pointer-events-none sm:hidden" aria-hidden="true">
                <svg
                  className="absolute inset-0 w-full h-full"
                  width="343"
                  height="388"
                  viewBox="0 0 343 388"
                  fill="none"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M-99 461.107L608.107-246l707.103 707.107-707.103 707.103L-99 461.107z"
                    fill="url(#linear1)"
                    fillOpacity=".1"
                  />
                  <defs>
                    <linearGradient
                      id="linear1"
                      x1="254.553"
                      y1="107.554"
                      x2="961.66"
                      y2="814.66"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#fff" />
                      <stop offset="1" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div
                className="hidden absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none sm:block lg:hidden"
                aria-hidden="true"
              >
                <svg
                  className="absolute inset-0 w-full h-full"
                  width="359"
                  height="339"
                  viewBox="0 0 359 339"
                  fill="none"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M-161 382.107L546.107-325l707.103 707.107-707.103 707.103L-161 382.107z"
                    fill="url(#linear2)"
                    fillOpacity=".1"
                  />
                  <defs>
                    <linearGradient
                      id="linear2"
                      x1="192.553"
                      y1="28.553"
                      x2="899.66"
                      y2="735.66"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#fff" />
                      <stop offset="1" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div
                className="hidden absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none lg:block"
                aria-hidden="true"
              >
                <svg
                  className="absolute inset-0 w-full h-full"
                  width="160"
                  height="678"
                  viewBox="0 0 160 678"
                  fill="none"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M-161 679.107L546.107-28l707.103 707.107-707.103 707.103L-161 679.107z"
                    fill="url(#linear3)"
                    fillOpacity=".1"
                  />
                  <defs>
                    <linearGradient
                      id="linear3"
                      x1="192.553"
                      y1="325.553"
                      x2="899.66"
                      y2="1032.66"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#fff" />
                      <stop offset="1" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">Thông tin liên hệ</h3>
              <p className="mt-6 text-base text-primary-50 max-w-3xl">
                Lavie - Nhà phân phối nước tinh khiết hàng đầu khu vực, chuyên cung cấp nước uống cho các hộ gia đình, 
                văn phòng và đại lý. Hãy liên hệ với chúng tôi để được tư vấn và báo giá tốt nhất.
              </p>
              <dl className="mt-8 space-y-6">
                <dt><span className="sr-only">Địa chỉ</span></dt>
                <dd className="flex text-base text-primary-50">
                  <FaMapMarkerAlt className="flex-shrink-0 w-6 h-6 text-primary-200" aria-hidden="true" />
                  <span className="ml-3">123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</span>
                </dd>
                <dt><span className="sr-only">Số điện thoại</span></dt>
                <dd className="flex text-base text-primary-50">
                  <FaPhone className="flex-shrink-0 w-6 h-6 text-primary-200" aria-hidden="true" />
                  <span className="ml-3">+84 28 1234 5678</span>
                </dd>
                <dt><span className="sr-only">Email</span></dt>
                <dd className="flex text-base text-primary-50">
                  <FaEnvelope className="flex-shrink-0 w-6 h-6 text-primary-200" aria-hidden="true" />
                  <span className="ml-3">contact@lavie-water.com</span>
                </dd>
              </dl>
              <ul role="list" className="mt-8 flex space-x-6">
                <li>
                  <a className="text-primary-200 hover:text-primary-100" href="#">
                    <span className="sr-only">Facebook</span>
                    <FaFacebook className="h-6 w-6" />
                  </a>
                </li>
                <li>
                  <a className="text-primary-200 hover:text-primary-100" href="#">
                    <span className="sr-only">Instagram</span>
                    <FaInstagram className="h-6 w-6" />
                  </a>
                </li>
              </ul>
              <div className="mt-10">
                <Link href="/products" className="inline-flex items-center rounded-md border border-transparent bg-primary-100 px-4 py-2 text-base font-medium text-primary-700 hover:bg-primary-200">
                  Xem sản phẩm
                </Link>
              </div>
            </div>

            {/* Contact form */}
            <div className="py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12">
              <h3 className="text-lg font-medium text-gray-900">Gửi thông tin cho chúng tôi</h3>
              {submitted ? (
                <div className="mt-8 bg-green-50 p-6 rounded-lg">
                  <h4 className="text-lg font-medium text-green-800">Cảm ơn bạn đã liên hệ!</h4>
                  <p className="mt-2 text-green-700">
                    Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ lại trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setSubmitted(false)}
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="name"
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        autoComplete="tel"
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Loại yêu cầu
                    </label>
                    <div className="mt-1">
                      <select
                        id="type"
                        name="type"
                        className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="question">Câu hỏi chung</option>
                        <option value="order">Đặt hàng</option>
                        <option value="feedback">Góp ý, phản hồi</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border border-gray-300 rounded-md"
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang gửi...
                        </>
                      ) : (
                        'Gửi yêu cầu'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Map section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Vị trí cửa hàng
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Ghé thăm cửa hàng chính của chúng tôi tại TP. Hồ Chí Minh
            </p>
          </div>
          <div className="mt-10 aspect-w-16 aspect-h-9 overflow-hidden rounded-lg shadow-lg">
            <div className="w-full h-96 bg-gray-300">
              {/* In a real application, you would integrate with Google Maps or similar */}
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-600">Google Maps sẽ được tích hợp tại đây</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
