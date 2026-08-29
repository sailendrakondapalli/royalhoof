import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, Users, Bell, Menu, X,
  LogOut, ChevronRight, AlertTriangle, Store, Calendar, MessageSquare,
  TrendingUp, Clock, AlertCircle, Image, Gift
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { useAdminStore } from "../../store/adminStore"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

const NAV = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Products", icon: Package },
  { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { path: "/admin/events", label: "Events", icon: Calendar },
  { path: "/admin/packages", label: "Packages", icon: Gift },
  { path: "/admin/gallery", label: "Gallery", icon: Image },
  { path: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

function Sidebar({ pathname, onSignOut, onNavClick, user, pendingCount, lowStockCount }) {
  const initials = (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "A")
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Admin"

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 248, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-shrink-0 bg-[#3B2310] flex flex-col overflow-hidden border-r border-[#5D3A1A]/60"
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <Link to="/admin" onClick={onNavClick} className="flex items-center gap-2.5 select-none group">
          <span className="text-2xl leading-none">🔱</span>
          <div>
            <span className="text-white font-bold text-sm tracking-wide block" style={{ fontFamily: "Georgia, serif" }}>
              Rudhraksha
            </span>
            <span className="text-[#F59E0B] text-[10px] font-semibold uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = pathname === path || (path !== "/admin" && pathname.startsWith(path))
          const badge = label === "Orders" && pendingCount > 0 ? pendingCount : null
          const stockBadge = label === "Products" && lowStockCount > 0 ? lowStockCount : null
          return (
            <Link
              key={path}
              to={path}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group/item ${
                active
                  ? "bg-white/15 text-white font-semibold border-l-2 border-[#F59E0B] pl-[10px]"
                  : "text-white/70 hover:text-white hover:bg-white/10 border-l-2 border-transparent pl-[10px]"
              }`}
            >
              <Icon size={16} className={active ? "text-[#F59E0B]" : ""} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="bg-[#D97706] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              {!badge && stockBadge && (
                <span className="bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {stockBadge}
                </span>
              )}
              {active && <ChevronRight size={13} className="ml-auto text-[#F59E0B]" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: store link + user card */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all border-l-2 border-transparent pl-[10px]"
        >
          <Store size={16} />
          <span>View Store</span>
        </Link>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-red-300 hover:bg-red-900/20 transition-all border-l-2 border-transparent pl-[10px]"
        >
          <LogOut size={16} /> Logout
        </button>

        {/* Admin user card */}
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2.5 px-2 py-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D97706] to-[#5D3A1A] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{displayName}</p>
            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#D97706]/30 text-[#F59E0B] mt-0.5">
              Admin
            </span>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 1024) setSidebarOpen(false) }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { pathname } = useLocation()
  const { signOut, user } = useAuthStore()
  const { notifications, clearNotification, addNotification, orders, products, stats, loadOrders, loadProducts, computeStats } = useAdminStore()
  const navigate = useNavigate()
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  // Load data for stats strip
  useEffect(() => {
    loadOrders()
    loadProducts()
  }, [])

  useEffect(() => {
    if (orders.length > 0 || products.length > 0) computeStats()
  }, [orders, products])

  // Quick stats derived
  const pendingCount = orders.filter(o => o.payment_status === "pending").length
  const lowStockCount = products.filter(p => (p.stock || 0) < 10).length
  const today = new Date().toDateString()
  const todayOrders = orders.filter(o =>
    new Date(o.created_at).toDateString() === today &&
    o.order_status !== "cancelled" &&
    o.payment_status !== "failed"
  ).length

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [])

  const handleBellClick = () => {
    if (notifOpen) {
      const current = useAdminStore.getState().notifications
      current.forEach(n => clearNotification(n.id))
    }
    setNotifOpen(o => !o)
  }

  const getNotifLink = (n) => {
    const msg = n.msg?.toLowerCase() || ""
    if (msg.includes("stock")) return "/admin/products"
    if (msg.includes("order")) return "/admin/orders"
    if (msg.includes("user")) return "/admin/users"
    return "/admin"
  }

  const handleNotifClick = (n) => {
    clearNotification(n.id)
    setNotifOpen(false)
    navigate(getNotifLink(n))
  }

  const handleSignOut = async () => { await signOut(); toast.success("Signed out"); navigate("/") }

  // Realtime new-order notifications
  useEffect(() => {
    const channel = supabase
      .channel("admin-new-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const order = payload.new
        const addrObj = (() => { try { return typeof order.address === "string" ? JSON.parse(order.address) : (order.address || {}) } catch { return {} } })()
        const name = addrObj.full_name || "A customer"
        const amount = order.total_amount ? `₹${Math.ceil(order.total_amount).toLocaleString("en-IN")}` : ""
        const orderId = order.display_order_id || `#${String(order.id).slice(-6).toUpperCase()}`
        addNotification(`🛍️ New order ${orderId} from ${name} ${amount}`, "info")
        useAdminStore.getState().loadOrders(true)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const currentPageLabel = NAV.find(n => pathname === n.path || (n.path !== "/admin" && pathname.startsWith(n.path)))?.label || "Admin Panel"

  const initials = (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "A")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="flex h-screen bg-[#F8F5F0] overflow-hidden">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <Sidebar
            pathname={pathname}
            onSignOut={handleSignOut}
            onNavClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false) }}
            user={user}
            pendingCount={pendingCount}
            lowStockCount={lowStockCount}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          {/* Main header row */}
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(o => !o)}
                className="text-gray-500 hover:text-[#5D3A1A] p-1 transition-colors rounded-lg hover:bg-[#FAFAFA]"
              >
                <Menu size={20} />
              </button>
              <span className="text-gray-700 text-sm font-semibold hidden sm:block">{currentPageLabel}</span>
            </div>

            {/* Quick stats strip — inline in header */}
            <div className="hidden md:flex items-center gap-1 bg-[#F8F5F0] rounded-xl px-3 py-1.5 border border-gray-200">
              <Link to="/admin/orders" className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white transition-colors group/stat">
                <TrendingUp size={13} className="text-green-500" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 leading-none">Today</p>
                  <p className="text-xs font-bold text-gray-700 leading-tight">{todayOrders}</p>
                </div>
              </Link>
              <div className="w-px h-6 bg-gray-200" />
              <Link to="/admin/orders" className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white transition-colors">
                <Clock size={13} className="text-[#D97706]" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 leading-none">Pending</p>
                  <p className={`text-xs font-bold leading-tight ${pendingCount > 0 ? "text-[#D97706]" : "text-gray-700"}`}>{pendingCount}</p>
                </div>
              </Link>
              <div className="w-px h-6 bg-gray-200" />
              <Link to="/admin/products" className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white transition-colors">
                <AlertCircle size={13} className="text-yellow-500" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 leading-none">Low Stock</p>
                  <p className={`text-xs font-bold leading-tight ${lowStockCount > 0 ? "text-yellow-600" : "text-gray-700"}`}>{lowStockCount}</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleBellClick}
                  className="relative text-gray-500 hover:text-[#5D3A1A] p-1.5 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-gray-800 text-sm font-semibold">Notifications</span>
                        <div className="flex items-center gap-2">
                          {notifications.length > 0 && (
                            <button onClick={() => notifications.forEach(n => clearNotification(n.id))}
                              className="text-xs text-[#5D3A1A] hover:underline">Clear all</button>
                          )}
                          <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0
                          ? <p className="text-gray-400 text-xs text-center py-6">No notifications</p>
                          : notifications.map(n => (
                            <div key={n.id}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer"
                              onClick={() => handleNotifClick(n)}>
                              <AlertTriangle size={14} className={`mt-0.5 ${n.type === "warning" ? "text-yellow-500" : "text-[#D97706]"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-700 text-xs">{n.msg}</p>
                                <p className="text-gray-400 text-xs mt-0.5">{new Date(n.time).toLocaleTimeString()}</p>
                              </div>
                              <button onClick={e => { e.stopPropagation(); clearNotification(n.id) }} className="text-gray-300 hover:text-gray-500">
                                <X size={12} />
                              </button>
                            </div>
                          ))
                        }
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="flex items-center gap-2 relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-[#D97706] to-[#5D3A1A] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-white text-xs font-bold">{initials}</span>
                  </div>
                  <span className="text-gray-600 text-xs hidden sm:block font-medium">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0]}
                  </span>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#FAFAFA] to-white">
                        <p className="text-gray-800 text-xs font-semibold truncate">
                          {user?.user_metadata?.full_name || user?.user_metadata?.name || "Admin"}
                        </p>
                        <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#5D3A1A]/10 text-[#5D3A1A]">
                          Administrator
                        </span>
                      </div>
                      <Link to="/" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Store size={14} /> View Store
                      </Link>
                      <button
                        onClick={() => { setProfileOpen(false); handleSignOut() }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
