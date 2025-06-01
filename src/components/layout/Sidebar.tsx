'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FaHome,
  FaUsers,
  FaBoxes,
  FaShoppingCart,
  FaWarehouse,
  FaExchangeAlt,
  FaChartBar,
  FaUser,
  FaSignOutAlt,
  FaWater
} from 'react-icons/fa'

type NavItem = {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

export default function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('userData')
    if (userData) {
      const { role } = JSON.parse(userData)
      setUserRole(role)
    }
  }, [])

  const navItems: NavItem[] = [
    {
      title: 'Tổng quan',
      href: '/dashboard',
      icon: <FaHome className="w-5 h-5" />,
      roles: ['admin', 'sales', 'delivery']
    },
    {
      title: 'Khách hàng',
      href: '/dashboard/customers',
      icon: <FaUsers className="w-5 h-5" />,
      roles: ['admin', 'sales']
    },
    {
      title: 'Sản phẩm',
      href: '/dashboard/products',
      icon: <FaBoxes className="w-5 h-5" />,
      roles: ['admin', 'sales']
    },
    {
      title: 'Đơn hàng',
      href: '/dashboard/orders',
      icon: <FaShoppingCart className="w-5 h-5" />,
      roles: ['admin', 'sales', 'delivery']
    },
    // {
    //   title: 'Kho hàng',
    //   href: '/dashboard/inventory',
    //   icon: <FaWarehouse className="w-5 h-5" />,
    //   roles: ['admin']
    // },
    // {
    //   title: 'Giao dịch',
    //   href: '/dashboard/transactions',
    //   icon: <FaExchangeAlt className="w-5 h-5" />,
    //   roles: ['admin', 'sales']
    // },
    {
      title: 'Báo cáo',
      href: '/dashboard/reports',
      icon: <FaChartBar className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      title: 'Quản lý người dùng',
      href: '/dashboard/users',
      icon: <FaUsers className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      title: 'Nhà cung cấp',
      href: '/dashboard/suppliers',
      icon: <FaWarehouse className="w-5 h-5" />,
      roles: ['admin']
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    window.location.href = '/login'
  }

  return (
    <div className="h-full flex flex-col bg-primary-900 text-white w-64 fixed inset-y-0 left-0">
      <div className="flex items-center justify-center h-16 px-4 bg-primary-800">
        <FaWater className="w-8 h-8 mr-2" />
        <span className="text-xl font-bold">LAVIE WATER</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {navItems
            .filter(item => userRole ? item.roles.includes(userRole) : false)
            .map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg hover:bg-primary-800 transition-colors ${pathname === item.href ? 'bg-primary-700' : ''
                    }`}
                >
                  <div className="mr-3">{item.icon}</div>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <div className="p-4 border-t border-primary-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 rounded-lg hover:bg-primary-800 transition-colors"
        >
          <FaSignOutAlt className="w-5 h-5 mr-3" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}
