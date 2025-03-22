"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // If roles are specified, check if user has required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default ProtectedRoute

