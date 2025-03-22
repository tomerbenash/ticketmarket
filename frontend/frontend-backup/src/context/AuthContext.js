"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { login as apiLogin, register as apiRegister, getCurrentUser } from "../services/api"

// Create context
const AuthContext = createContext()

// Create provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const response = await getCurrentUser()
          setUser(response.data)
        }
      } catch (err) {
        console.error("Error checking authentication:", err)
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      setError(null)
      const response = await apiLogin(credentials)
      const { access_token, user } = response.data

      // Save token and user data
      localStorage.setItem("token", access_token)
      setUser(user)
      return user
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed")
      throw err
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      setError(null)
      const response = await apiRegister(userData)
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed")
      throw err
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

