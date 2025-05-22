'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string
  username: string
  role: 'admin' | 'sales' | 'customer'
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkUserRole: (allowedRoles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('userToken')
        const userData = localStorage.getItem('userData')

        if (token && userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.error('Authentication error:', error)
        // Clear any invalid data
        localStorage.removeItem('userToken')
        localStorage.removeItem('userData')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại')
      }

      // Save token to local storage
      localStorage.setItem('userToken', data.token)
      localStorage.setItem('userData', JSON.stringify({
        id: data._id,
        name: data.name,
        username: data.username,
        role: data.role
      }))

      setUser({
        id: data._id,
        name: data.name,
        username: data.username,
        role: data.role
      })

      // Redirect based on role
      if (data.role === 'admin') {
        router.push('/dashboard')
      } else if (data.role === 'sales') {
        router.push('/order')
      } else if (data.role === 'customer') {
        router.push('/customer/dashboard') // Điều hướng khách hàng vào màn hình riêng
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Có lỗi xảy ra khi đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    setUser(null)
    router.push('/login')
  }

  const checkUserRole = (allowedRoles: string[]) => {
    if (!user) return false
    return allowedRoles.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
