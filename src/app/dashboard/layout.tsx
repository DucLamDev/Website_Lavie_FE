'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const token = localStorage.getItem('userToken')
    const userData = localStorage.getItem('userData')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      const user = JSON.parse(userData)
      if (user.role !== 'admin') {
        // Redirect non-admin users to appropriate pages
        if (user.role === 'sales') {
          router.push('/order')
        } else {
          router.push('/') // Default redirect for other roles
        }
        return
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
