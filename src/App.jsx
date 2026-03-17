import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from '@/context/StoreContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import ProductsPage from '@/components/dashboard/ProductsPage'
import RecommendationsPage from '@/components/dashboard/RecommendationsPage'
import EmbedPage from '@/components/dashboard/EmbedPage'
import AnalyticsPage from '@/components/dashboard/AnalyticsPage'
import IntegrationsPage from '@/components/dashboard/IntegrationsPage'
import SettingsPage from '@/components/dashboard/SettingsPage'
import NotificationsPage from '@/pages/NotificationsPage'

// Protected route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-violet-500 animate-spin" />
    </div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardOverview />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="embed" element={<EmbedPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <StoreProvider>
          <AppRoutes />
        </StoreProvider>
      </AuthProvider>
    </Router>
  )
}
