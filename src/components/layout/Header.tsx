'use client'

import { useState, useEffect } from 'react'
import { FaBell, FaUser } from 'react-icons/fa'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function Header() {
  const [userData, setUserData] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const storedData = localStorage.getItem('userData')
    if (storedData) {
      setUserData(JSON.parse(storedData))
    }
  }, [])

  const roleText = {
    admin: 'Quản trị viên',
    sales: 'Nhân viên bán hàng',
    delivery: 'Nhân viên giao hàng'
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center px-6">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        <button className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <FaBell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
        </button>
        
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <span className="mr-2">{userData?.name || 'Người dùng'}</span>
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                <FaUser className="w-4 h-4" />
              </div>
            </Menu.Button>
          </div>
          
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:divide-gray-600 z-50">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userData?.name || 'Người dùng'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData?.role ? roleText[userData.role as keyof typeof roleText] : 'Người dùng'}
                </p>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/dashboard/account"
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-600' : ''
                      } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    >
                      Tài khoản của tôi
                    </a>
                  )}
                </Menu.Item>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        localStorage.removeItem('userToken')
                        localStorage.removeItem('userData')
                        window.location.href = '/login'
                      }}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-600' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    >
                      Đăng xuất
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  )
}
