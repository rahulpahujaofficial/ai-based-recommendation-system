import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { StoreProvider } from '@/context/StoreContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LandingPage from '@/pages/LandingPage'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import ProductsPage from '@/components/dashboard/ProductsPage'
import RecommendationsPage from '@/components/dashboard/RecommendationsPage'
import EmbedPage from '@/components/dashboard/EmbedPage'
import AnalyticsPage from '@/components/dashboard/AnalyticsPage'
import IntegrationsPage from '@/components/dashboard/IntegrationsPage'
import SettingsPage from '@/components/dashboard/SettingsPage'

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="recommendations" element={<RecommendationsPage />} />
                <Route path="embed" element={<EmbedPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </StoreProvider>
  )
}
