import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'sonner'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import MenuPage from '@/pages/MenuPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrderSuccessPage from '@/pages/OrderSuccessPage'
import LoginPage from '@/pages/LoginPage'
import CashierDashboard from '@/pages/CashierDashboard'
import KitchenDisplay from '@/pages/KitchenDisplay'
import OwnerDashboard from '@/pages/OwnerDashboard'
import ManualOrderPage from '@/pages/ManualOrderPage'
import QRGeneratorPage from '@/pages/QRGeneratorPage'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Customer */}
            <Route path="/order" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />

            {/* Staff */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard/cashier" element={
              <ProtectedRoute roles={['cashier', 'owner']}><CashierDashboard /></ProtectedRoute>
            } />
            <Route path="/dashboard/cashier/new-order" element={
              <ProtectedRoute roles={['cashier', 'owner']}><ManualOrderPage /></ProtectedRoute>
            } />
            <Route path="/dashboard/kitchen" element={
              <ProtectedRoute roles={['koki', 'cashier', 'owner']}><KitchenDisplay /></ProtectedRoute>
            } />
            <Route path="/dashboard/owner" element={
              <ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>
            } />
            <Route path="/dashboard/qr" element={
              <ProtectedRoute roles={['cashier', 'owner']}><QRGeneratorPage /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/order?table=1" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors theme="dark" />
      </CartProvider>
    </AuthProvider>
  )
}