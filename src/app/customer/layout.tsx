'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { FaHome, FaShoppingCart, FaHistory, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Nếu không đăng nhập hoặc không phải khách hàng, chuyển hướng về trang đăng nhập
    if (!isLoading && (!isAuthenticated || user?.role !== 'customer')) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const menuItems = [
    { name: 'Trang chủ', href: '/customer/dashboard', icon: <FaHome /> },
    { name: 'Đặt hàng', href: '/customer/order', icon: <FaShoppingCart /> },
    { name: 'Lịch sử đơn hàng', href: '/customer/order-history', icon: <FaHistory /> },
    { name: 'Tài khoản', href: '/customer/profile', icon: <FaUser /> },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-primary-700 text-white">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <span className="text-xl font-bold">Lavie Water</span>
            </div>
            <div className="flex flex-col flex-grow">
              <nav className="flex-1 px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      pathname === item.href
                        ? 'bg-primary-800 text-white'
                        : 'text-white hover:bg-primary-600'
                    }`}
                  >
                    <span className="mr-3 h-5 w-5">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-primary-600">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-primary-300">Khách hàng</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-3 flex items-center text-sm text-primary-200 hover:text-white"
              >
                <FaSignOutAlt className="mr-2" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden">
          <div className="flex items-center justify-between bg-primary-700 px-4 py-2 text-white">
            <div>
              <span className="text-xl font-bold">Lavie Water</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-primary-600"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
          {isMobileMenuOpen && (
            <div className="bg-primary-700 text-white">
              <nav className="px-2 pt-2 pb-3 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      pathname === item.href
                        ? 'bg-primary-800 text-white'
                        : 'text-white hover:bg-primary-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mr-3 h-5 w-5">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="w-full flex items-center px-2 py-2 text-base font-medium text-white hover:bg-primary-600 rounded-md"
                >
                  <FaSignOutAlt className="mr-3 h-5 w-5" />
                  Đăng xuất
                </button>
              </nav>
            </div>
          )}
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
