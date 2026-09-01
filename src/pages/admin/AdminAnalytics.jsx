import { useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, MapPin, ShoppingBag, DollarSign } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { formatINR } from '../../utils/format'

const COLORS = ['#B8955A', '#B6A58F', '#9A8870', '#7A6A54', '#5A4A38', '#C4B09A', '#E8D8C4', '#F0E8D8']

const TooltipStyle = {
  contentStyle: { background: '#2C2C2C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11, color: '#F3EBDD' },
  labelStyle: { color: 'rgba(243,235,221,0.5)' },
}

export default function AdminAnalytics() {
  const { stats, orders, loadOrders, loadProducts, computeStats } = useAdminStore()

  useEffect(() => {
    Promise.all([loadOrders(), loadProducts()]).then(() => computeStats())
  }, [])

  if (!stats) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
        <div style={{ width: 32, height: 32, border: "2px solid #B8955A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Revenue by category
  const revenueByCategory = stats.categorySales

  // Monthly revenue (last 30 days grouped by week)
  const weeklyData = []
  for (let w = 3; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - (w + 1) * 7)
    const end = new Date(); end.setDate(end.getDate() - w * 7)
    const label = `Week ${4 - w}`
    const weekOrders = orders.filter(o => {
      const d = new Date(o.created_at)
      return d >= start && d < end
    })
    weeklyData.push({
      week: label,
      orders: weekOrders.length,
      revenue: weekOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total_amount, 0),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: "#F3EBDD" }}>Analytics</h1>
        <p style={{ color: "rgba(243,235,221,0.45)", fontSize: "0.875rem", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>Sales performance and insights</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Total Revenue', value: formatINR(stats.totalRevenue) },
          { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders },
          { icon: TrendingUp, label: 'Avg Order Value', value: formatINR(stats.totalOrders ? Math.round(stats.totalRevenue / stats.paidOrders || 0) : 0) },
          { icon: MapPin, label: 'Cities Reached', value: stats.cityData?.length || 0 },
        ].map((k, i) => (
          <div key={i} style={{ background: "#5B1E28", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 20 }}>
            <k.icon size={18} style={{ color: "#B8955A", marginBottom: 12 }} />
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F3EBDD", fontFamily: "'Inter', sans-serif" }}>{k.value}</p>
            <p style={{ color: "rgba(243,235,221,0.45)", fontSize: "0.8125rem", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Area Chart */}
      <div style={{ background: "#5B1E28", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 20 }}>
        <h3 style={{ color: "#F3EBDD", fontWeight: 600, marginBottom: 16, fontSize: "0.9375rem", fontFamily: "'Inter', sans-serif" }}>Revenue Trend (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={stats.last14Days}>
            <defs>
              <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8955A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#B8955A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(243,235,221,0.4)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'rgba(243,235,221,0.4)', fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...TooltipStyle} formatter={(v, n) => [n === 'revenue' ? formatINR(v) : v, n]} />
            <Area type="monotone" dataKey="revenue" stroke="#B8955A" fill="url(#accentGrad)" strokeWidth={2} name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={{ background: "#5B1E28", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 20 }}>
          <h3 style={{ color: "#F3EBDD", fontWeight: 600, marginBottom: 16, fontSize: "0.9375rem", fontFamily: "'Inter', sans-serif" }}>Weekly Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: 'rgba(243,235,221,0.4)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(243,235,221,0.4)', fontSize: 11 }} />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="orders" fill="#B8955A" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#5B1E28", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 20 }}>
          <h3 style={{ color: "#F3EBDD", fontWeight: 600, marginBottom: 16, fontSize: "0.9375rem", fontFamily: "'Inter', sans-serif" }}>Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={revenueByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {revenueByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...TooltipStyle} formatter={v => formatINR(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Analytics */}
      <div style={{ background: "#5B1E28", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 20 }}>
        <h3 style={{ color: "#F3EBDD", fontWeight: 600, marginBottom: 16, fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Inter', sans-serif" }}>
          <MapPin size={15} style={{ color: "#B8955A" }} /> Location Analytics — Top Cities
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: 'rgba(243,235,221,0.4)', fontSize: 10 }} />
              <YAxis dataKey="city" type="category" tick={{ fill: 'rgba(243,235,221,0.4)', fontSize: 11 }} width={80} />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="count" fill="#B6A58F" radius={[0, 4, 4, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            {stats.cityData.map((c, i) => (
              <div key={c.city} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#B8955A", fontSize: "0.75rem", width: 20, fontWeight: 700 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#F3EBDD", fontSize: "0.75rem" }}>{c.city}</span>
                    <span style={{ color: "rgba(243,235,221,0.4)", fontSize: "0.6875rem" }}>{c.count} orders</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 9999 }}>
                    <div style={{
                      height: "100%", borderRadius: 9999,
                      width: `${(c.count / stats.cityData[0].count) * 100}%`,
                      background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div style={{ background: "#5B1E28", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 20 }}>
        <h3 style={{ color: "#F3EBDD", fontWeight: 600, marginBottom: 16, fontSize: "0.9375rem", fontFamily: "'Inter', sans-serif" }}>Best Selling Products</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stats.topProducts}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(243,235,221,0.4)', fontSize: 9 }} />
            <YAxis tick={{ fill: 'rgba(243,235,221,0.4)', fontSize: 10 }} />
            <Tooltip {...TooltipStyle} />
            <Bar dataKey="qty" radius={[4, 4, 0, 0]} name="Units Sold">
              {stats.topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
