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
  <div className="min-h-[60vh] flex items-center justify-center" style={{ background: "#2C2C2C" }}>
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: "#9A7650", borderTopColor: "transparent" }} />
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
          {/* Admin routes — own layout, no storefront navbar/footer */}
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
            <div className="min-h-screen flex flex-col" style={{ background: "#2C2C2C" }}>
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
              background: '#F2EAE0',
              color: '#734129',
              border: '1px solid #D4C4B4',
              boxShadow: '4px 4px 16px #C5B5A5, -2px -2px 8px #F8F3ED',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '500',
              padding: '14px 20px',
              maxWidth: '420px',
              textAlign: 'center',
              fontFamily: 'Georgia, serif',
            },
            success: {
              style: {
                background: '#f4faf0',
                color: '#3a6b2a',
                border: '1px solid #c0dba0',
              },
              iconTheme: { primary: '#5c7a3e', secondary: '#fff' },
            },
            error: {
              style: {
                background: '#fff1f2',
                color: '#9f1239',
                border: '1px solid #fecdd3',
              },
              iconTheme: { primary: '#e11d48', secondary: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
    </LanguageProvider>
  )
}
