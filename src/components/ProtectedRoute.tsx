'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

type ProtectedRouteProps = {
  children: ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, checkUserRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
      } else if (!checkUserRole(allowedRoles)) {
        // Redirect based on role if not authorized
        if (user?.role === 'admin') {
          router.push('/dashboard')
        } else if (user?.role === 'sales') {
          router.push('/order')
        } else {
          router.push('/dashboard')
        }
      }
    }
  }, [isAuthenticated, isLoading, allowedRoles, redirectTo, router, checkUserRole, user])

  // Show loading or nothing while checking authentication
  if (isLoading || !isAuthenticated || !checkUserRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
