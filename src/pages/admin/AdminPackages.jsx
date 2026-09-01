import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Star, Eye, EyeOff } from 'lucide-react'

const CARD_BG = "#5B1E28"
const CARD_BORDER = "rgba(255,255,255,0.07)"
const TEXT_PRIMARY = "#F3EBDD"
const TEXT_MUTED = "rgba(243,235,221,0.45)"
const ACCENT = "#B8955A"

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 5,
  padding: "9px 12px", color: TEXT_PRIMARY, fontSize: "0.875rem",
  fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box",
}
const labelStyle = {
  display: "block", color: TEXT_MUTED, fontSize: "0.6875rem",
  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5,
  fontFamily: "'Inter', sans-serif",
}

export default function AdminPackages() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [features, setFeatures] = useState([''])
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, duration: 'month',
    package_type: 'adult', age_group: '', features: [],
    is_popular: false, is_active: true, display_order: 0
  })

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('packages').select('*').order('display_order', { ascending: true })
      if (error) throw error
      setItems(data || [])
    } catch { toast.error('Failed to fetch packages') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const packageData = { ...formData, features: features.filter(f => f.trim() !== '') }
    try {
      if (editingItem) {
        const { error } = await supabase.from('packages').update(packageData).eq('id', editingItem.id)
        if (error) throw error
        toast.success('Package updated!')
      } else {
        const { error } = await supabase.from('packages').insert([packageData])
        if (error) throw error
        toast.success('Package created!')
      }
      setShowForm(false); setEditingItem(null); resetForm(); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this package?')) return
    try {
      const { error } = await supabase.from('packages').delete().eq('id', id)
      if (error) throw error
      toast.success('Deleted'); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const toggleActive = async (item) => {
    try {
      const { error } = await supabase.from('packages').update({ is_active: !item.is_active }).eq('id', item.id)
      if (error) throw error
      toast.success(item.is_active ? 'Hidden' : 'Visible'); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', price: 0, duration: 'month', package_type: 'adult', age_group: '', features: [], is_popular: false, is_active: true, display_order: 0 })
    setFeatures([''])
  }

  const startEdit = (item) => {
    setEditingItem(item); setFormData(item)
    setFeatures(item.features?.length > 0 ? item.features : [''])
    setShowForm(true)
  }

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }))

  if (loading) return <div style={{ padding: 32, color: TEXT_MUTED, fontFamily: "'Inter', sans-serif" }}>Loading...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: TEXT_PRIMARY }}>Packages</h1>
          <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>Manage riding packages and pricing</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingItem(null); resetForm() }}
          style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, color: "#5B1E28", border: "none", borderRadius: 4, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
          <Plus size={16} /> Add Package
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 24 }}>
          <h2 style={{ color: TEXT_PRIMARY, fontSize: "1.125rem", fontWeight: 600, marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
            {editingItem ? 'Edit' : 'Add'} Package
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Package Name *</label>
                <input value={formData.name} onChange={e => set('name', e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={formData.package_type} onChange={e => set('package_type', e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="adult">Adult</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={formData.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, resize: "none" }} rows={2} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Price (₹) *</label>
                <input type="number" value={formData.price} onChange={e => set('price', parseFloat(e.target.value))} style={inputStyle} min="0" step="0.01" required />
              </div>
              <div>
                <label style={labelStyle}>Duration</label>
                <select value={formData.duration} onChange={e => set('duration', e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly (3 months)</option>
                  <option value="6 months">6 Months</option>
                  <option value="year">Annual</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Age Group (kids)</label>
                <input value={formData.age_group} onChange={e => set('age_group', e.target.value)} style={inputStyle} placeholder="e.g. 5-12 years" />
              </div>
            </div>

            {/* Features */}
            <div>
              <label style={labelStyle}>Features</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {features.map((feature, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <input value={feature} onChange={e => { const f = [...features]; f[i] = e.target.value; setFeatures(f) }}
                      style={{ ...inputStyle, flex: 1 }} placeholder="e.g. 4 sessions per week" />
                    <button type="button" onClick={() => setFeatures(features.filter((_, fi) => fi !== i))}
                      style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setFeatures([...features, ''])}
                  style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.8125rem", fontFamily: "'Inter', sans-serif", padding: 0 }}>
                  + Add Feature
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Display Order</label>
                <input type="number" value={formData.display_order} onChange={e => set('display_order', parseInt(e.target.value))} style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.is_popular} onChange={e => set('is_popular', e.target.checked)} style={{ width: 15, height: 15 }} />
                  <span style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>Mark as Popular</span>
                </label>
              </div>
              <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 15, height: 15 }} />
                  <span style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>Active</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" style={{ background: ACCENT, color: "#5B1E28", border: "none", borderRadius: 4, padding: "10px 24px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); resetForm() }}
                style={{ background: "rgba(255,255,255,0.06)", color: TEXT_MUTED, border: `1px solid ${CARD_BORDER}`, borderRadius: 4, padding: "10px 24px", cursor: "pointer", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Package cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 20, position: "relative" }}>
            {item.is_popular && (
              <div style={{ position: "absolute", top: 14, right: 14 }}>
                <Star size={18} fill={ACCENT} stroke="none" />
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ color: TEXT_PRIMARY, fontSize: "1.125rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", marginBottom: 6 }}>{item.name}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.6875rem", padding: "2px 8px", borderRadius: 9999, background: item.package_type === 'adult' ? "rgba(59,130,246,0.12)" : "rgba(168,85,247,0.12)", color: item.package_type === 'adult' ? "#60a5fa" : "#c084fc" }}>
                  {item.package_type}
                </span>
                {item.age_group && <span style={{ color: TEXT_MUTED, fontSize: "0.6875rem" }}>{item.age_group}</span>}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <span style={{ color: ACCENT, fontSize: "1.75rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>₹{item.price?.toLocaleString()}</span>
              <span style={{ color: TEXT_MUTED, fontSize: "0.8125rem" }}>/{item.duration}</span>
            </div>

            {item.description && (
              <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginBottom: 12, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{item.description}</p>
            )}

            {item.features?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: TEXT_MUTED, fontSize: "0.6875rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>Includes</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {item.features.slice(0, 4).map((f, i) => (
                    <li key={i} style={{ color: TEXT_PRIMARY, fontSize: "0.8125rem", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: ACCENT, fontSize: "0.5rem" }}>◆</span> {f}
                    </li>
                  ))}
                  {item.features.length > 4 && <li style={{ color: TEXT_MUTED, fontSize: "0.75rem" }}>+{item.features.length - 4} more</li>}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${CARD_BORDER}` }}>
              <button onClick={() => toggleActive(item)} style={{
                display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem",
                background: "none", border: "none", cursor: "pointer",
                color: item.is_active ? "#4ade80" : TEXT_MUTED,
              }}>
                {item.is_active ? <><Eye size={13} /> Visible</> : <><EyeOff size={13} /> Hidden</>}
              </button>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => startEdit(item)} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer" }}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(item.id)} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: "48px", textAlign: "center", color: TEXT_MUTED, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
          No packages yet. Click "Add Package" to create one.
        </div>
      )}
    </div>
  )
}
