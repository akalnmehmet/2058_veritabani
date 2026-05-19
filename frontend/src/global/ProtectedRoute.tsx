// Path: @/global/ProtectedRoute.tsx
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute() {
  const location = useLocation()

  const reduxToken = useSelector(state => state.auth?.token)
  const storageToken = localStorage.getItem('token') || sessionStorage.getItem('token')
  const token = reduxToken || storageToken
  const bootstrapped = useSelector(state => !!state.auth?.bootstrapped)



  if (!bootstrapped) {
    return (
      <div className="min-h-[40vh] grid place-items-center bg-background text-foreground">
        <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }


  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
