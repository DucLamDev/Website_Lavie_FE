'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaShoppingCart, FaHome, FaWater, FaPhone, FaInfoCircle, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt, FaHistory, FaMoneyBillWave } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Define navigation items based on user role
  const getNavItems = () => {
    const publicItems = [
      { name: 'Trang chủ', href: '/', icon: <FaHome /> },
      { name: 'Sản phẩm', href: '/products', icon: <FaWater /> },
      { name: 'Giới thiệu', href: '/about', icon: <FaInfoCircle /> },
      { name: 'Liên hệ', href: '/contact', icon: <FaPhone /> },
    ]
    
    if (!isAuthenticated) {
      return publicItems
    }
    
    // Add role-specific items
    if (user?.role === 'admin') {
      return [
        ...publicItems,
        { name: 'Quản lý', href: '/dashboard', icon: <FaTachometerAlt /> },
      ]
    } else if (user?.role === 'sales') {
      return [
        { name: 'Dashboard', href: '/sales/dashboard', icon: <FaTachometerAlt /> },
        { name: 'Đặt hàng tại quầy', href: '/sales/order', icon: <FaShoppingCart /> },
        { name: 'Đơn hàng trong ngày', href: '/sales/orders', icon: <FaHistory /> },
        { name: 'Doanh thu', href: '/sales/revenue', icon: <FaMoneyBillWave /> },
        // { name: 'Tồn kho', href: '/sales/inventory', icon: <FaWater /> },
        { name: 'Khách hàng', href: '/sales/customers', icon: <FaUser /> }
        // ...publicItems,
      ]
    } else if (user?.role === 'customer') {
      return [
        { name: 'Dashboard', href: '/customer/dashboard', icon: <FaTachometerAlt /> },
        ...publicItems,
        { name: 'Đặt hàng', href: '/customer/order', icon: <FaShoppingCart /> },
      ]
    } else {
      return [
        ...publicItems,
        { name: 'Đặt hàng', href: '/order', icon: <FaShoppingCart /> },
      ]
    }
  }
  
  const navItems = getNavItems()

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-primary-600 font-bold text-2xl">Lavie Water</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-1 font-medium transition-colors ${
                  pathname === item.href 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <Link 
                href="/login"
                className="flex items-center gap-1 font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-md transition-colors"
              >
                <FaUser />
                <span>Đăng nhập</span>
              </Link>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <FaUser />
                  <span>{user?.name || 'Tài khoản'}</span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {user?.role === 'admin' && (
                      <Link 
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Quản lý hệ thống
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        logout()
                        setIsDropdownOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    pathname === item.href 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Auth Buttons for Mobile */}
              {!isAuthenticated ? (
                <Link 
                  href="/login"
                  className="flex items-center gap-2 p-2 bg-primary-600 text-white rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser />
                  <span>Đăng nhập</span>
                </Link>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="px-2 py-1 text-sm text-gray-500">
                      Đăng nhập với: {user?.name}
                    </div>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <Link 
                      href="/dashboard"
                      className="flex items-center gap-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaTachometerAlt />
                      <span>Quản lý hệ thống</span>
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-2 p-2 rounded-md text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <FaSignOutAlt />
                    <span>Đăng xuất</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
