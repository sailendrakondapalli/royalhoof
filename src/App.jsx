import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/admin/AdminLayout.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import IntroAnimation from './components/IntroAnimation'
import AnimatedRoutes from './components/AnimatedRoutes'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useWishlistStore } from './store/wishlistStore'
import { LanguageProvider } from './context/LanguageContext'

// Storefront pages (code split)
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const EnquiryPage = lazy(() => import('./pages/EnquiryPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const PolicyPage = lazy(() => import('./pages/PolicyPage'))

// Admin pages (code split)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'))
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries'))
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'))
const AdminPackages = lazy(() => import('./pages/admin/AdminPackages'))


const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-royal-cream">
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-[#C5963A]" />
  </div>
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { 
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

export default function App() {
  const { initialize, user } = useAuthStore()
  const { loadCart } = useCartStore()
  const { loadWishlist } = useWishlistStore()
  const [showIntro, setShowIntro] = useState(true)
  const [introComplete, setIntroComplete] = useState(false)

  useEffect(() => { initialize() }, [])

  useEffect(() => {
    if (user) {
      loadCart(user.id)
      loadWishlist(user.id)
    } else {
      loadCart(null)
    }
  }, [user])

  const handleIntroComplete = () => {
    setIntroComplete(true)
    setTimeout(() => setShowIntro(false), 500)
  }

  return (
    <LanguageProvider>
    <HelmetProvider>
      {/* Intro Animation */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Admin routes - own layout, no storefront navbar/footer */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="about" element={<AdminAbout />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="events" element={<AdminEvents />} />
                      <Route path="packages" element={<AdminPackages />} />
                      <Route path="gallery" element={<AdminGallery />} />
                      <Route path="enquiries" element={<AdminEnquiries />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="users" element={<AdminUsers />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </AdminLayout>
            </AdminRoute>
          } />

          {/* Storefront routes */}
          <Route path="/*" element={
            <div className="min-h-screen flex flex-col bg-royal-cream">
              <Navbar />
              <main className="flex-1">
                <AnimatedRoutes />
              </main>
              <Footer />
            </div>
          } />
        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FAF3E4',
              color: '#292725',
              border: '1px solid rgba(197, 150, 58, 0.35)',
              boxShadow: '0 8px 32px rgba(8, 43, 73, 0.12)',
              borderRadius: '2px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '14px 20px',
              maxWidth: '420px',
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
            },
            success: {
              style: {
                background: '#F4E9D2',
                color: '#292725',
                border: '1px solid rgba(90, 138, 90, 0.4)',
              },
              iconTheme: { primary: '#5A8A5A', secondary: '#F4E9D2' },
            },
            error: {
              style: {
                background: '#FAF3E4',
                color: '#292725',
                border: '1px solid rgba(160, 64, 72, 0.4)',
              },
              iconTheme: { primary: '#A04048', secondary: '#F4E9D2' },
            },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
    </LanguageProvider>
  )
}
