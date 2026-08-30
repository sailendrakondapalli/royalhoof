import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  ShoppingBag, Calendar, Package, MessageSquare,
  TrendingUp, Clock, Image, Users
} from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { formatINR } from '../../utils/format'

// Royal Hoof palette
const CARD_BG = "#242120"
const CARD_BORDER = "rgba(255,255,255,0.07)"
const TEXT_PRIMARY = "#F3EBDD"
const TEXT_MUTED = "rgba(243,235,221,0.45)"
const ACCENT = "#D8C7AE"

const StatCard = ({ icon: Icon, label, value, sub, to, accent }) => (
  <Link to={to || "#"} style={{ textDecoration: "none" }}>
    <motion.div
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 8,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: "pointer",
        transition: "border-color 0.2s",
        minHeight: 120,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(216,199,174,0.3)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 6,
        background: "rgba(216,199,174,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={17} style={{ color: ACCENT }} />
      </div>
      <div>
        <p style={{ fontSize: "1.5rem", fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: "0.8125rem", color: TEXT_MUTED, marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{label}</p>
        {sub && <p style={{ fontSize: "0.6875rem", color: TEXT_MUTED, marginTop: 2 }}>{sub}</p>}
      </div>
    </motion.div>
  </Link>
)

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "#2C2C2C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 12px", fontSize: 11 }}>
      <p style={{ color: TEXT_MUTED, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: ACCENT }}>{p.name}: {p.name === "revenue" ? formatINR(p.value) : p.value}</p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { stats, orders, loadOrders, loadProducts, computeStats } = useAdminStore()

  useEffect(() => {
    Promise.all([loadOrders(), loadProducts()]).then(() => computeStats())
  }, [])

  if (!stats) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${ACCENT}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Derive quick counts from orders
  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today).length
  const pendingEnquiries = stats.totalOrders || 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
          Welcome back. Here's what's happening at Royal Hoof.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="Total Enquiries" value={stats.totalOrders ?? 0} sub="All time" to="/admin/enquiries" />
        <StatCard icon={Calendar} label="Events" value={stats.totalProducts ?? 0} sub="Active events" to="/admin/events" />
        <StatCard icon={Clock} label="Today's Enquiries" value={todayOrders} to="/admin/enquiries?filter=today" />
        <StatCard icon={Users} label="Testimonials" value={stats.lowStockCount ?? 0} sub="Pending approval" to="/admin/testimonials" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enquiries Line Chart */}
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 20 }}>
          <h3 style={{ color: TEXT_PRIMARY, fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Inter', sans-serif" }}>
            <TrendingUp size={15} style={{ color: ACCENT }} /> Enquiries — Last 14 Days
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.last14Days || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: TEXT_MUTED, fontSize: 10 }} />
              <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="orders" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 3 }} name="enquiries" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue / Revenue Bar Chart */}
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 20 }}>
          <h3 style={{ color: TEXT_PRIMARY, fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
            Revenue — Last 14 Days
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.last14Days || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: TEXT_MUTED, fontSize: 10 }} />
              <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" fill={ACCENT} radius={[3, 3, 0, 0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders/enquiries */}
      {(() => {
        const days = []
        for (let i = 0; i < 3; i++) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const ds = d.toDateString()
          const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })
          const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === ds)
          days.push({ label, orders: dayOrders })
        }
        const hasAny = days.some(d => d.orders.length > 0)
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ color: TEXT_PRIMARY, fontSize: "0.9375rem", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                Recent Orders
                <span style={{ color: TEXT_MUTED, fontWeight: 400, fontSize: "0.75rem", marginLeft: 8 }}>({orders.length} total)</span>
              </h3>
              <Link to="/admin/orders" style={{ color: ACCENT, fontSize: "0.75rem", textDecoration: "none" }}>View all →</Link>
            </div>

            {!hasAny && (
              <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: "32px", textAlign: "center", color: TEXT_MUTED, fontSize: "0.875rem" }}>
                No orders in the last 3 days
              </div>
            )}

            {days.map(({ label, orders: dayOrders }) => dayOrders.length === 0 ? null : (
              <div key={label} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${CARD_BORDER}`, background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ color: ACCENT, fontSize: "0.75rem", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{label}</span>
                  <span style={{ color: TEXT_MUTED, fontSize: "0.6875rem" }}>{dayOrders.length} order{dayOrders.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Order ID", "Customer", "Amount", "Status", "Time"].map(h => (
                          <th key={h} style={{ textAlign: "left", color: TEXT_MUTED, fontSize: "0.6875rem", padding: "8px 16px", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dayOrders.map(o => {
                        const addr = (() => { try { return typeof o.address === "object" ? o.address : JSON.parse(o.address || "{}") } catch { return {} } })()
                        const customerName = addr.full_name || o.users?.email || "Guest"
                        return (
                          <tr key={o.id} style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                            <td style={{ padding: "10px 16px", color: ACCENT, fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 600 }}>{o.display_order_id || "#" + String(o.id).slice(-6).toUpperCase()}</td>
                            <td style={{ padding: "10px 16px", color: TEXT_PRIMARY, fontSize: "0.75rem", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customerName}</td>
                            <td style={{ padding: "10px 16px", color: TEXT_PRIMARY, fontSize: "0.75rem" }}>{formatINR(o.total_amount)}</td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{
                                fontSize: "0.6875rem", padding: "3px 8px", borderRadius: 9999, fontWeight: 500,
                                background: o.payment_status === "paid" ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)",
                                color: o.payment_status === "paid" ? "#4ade80" : "#fbbf24",
                              }}>
                                {o.payment_status === "paid" ? "Paid" : "Pending"}
                              </span>
                            </td>
                            <td style={{ padding: "10px 16px", color: TEXT_MUTED, fontSize: "0.6875rem" }}>{new Date(o.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
