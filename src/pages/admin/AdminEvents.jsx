import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, Users } from 'lucide-react'

const CARD_BG = "#242120"
const CARD_BORDER = "rgba(255,255,255,0.07)"
const TEXT_PRIMARY = "#F3EBDD"
const TEXT_MUTED = "rgba(243,235,221,0.45)"
const ACCENT = "#D8C7AE"

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 5,
  padding: "9px 12px",
  color: TEXT_PRIMARY,
  fontSize: "0.875rem",
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  boxSizing: "border-box",
}

const labelStyle = {
  display: "block",
  color: TEXT_MUTED,
  fontSize: "0.6875rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 5,
  fontFamily: "'Inter', sans-serif",
}

export default function AdminEvents() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '', description: '', event_date: '', event_time: '',
    location: '', category: '', capacity: 0, image_url: '',
    status: 'upcoming', is_active: true
  })

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: false })
      if (error) throw error
      setItems(data || [])
    } catch { toast.error('Failed to fetch events') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        const { error } = await supabase.from('events').update(formData).eq('id', editingItem.id)
        if (error) throw error
        toast.success('Event updated!')
      } else {
        const { error } = await supabase.from('events').insert([formData])
        if (error) throw error
        toast.success('Event created!')
      }
      setShowForm(false); setEditingItem(null); resetForm(); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    try {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
      toast.success('Event deleted'); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const toggleActive = async (item) => {
    try {
      const { error } = await supabase.from('events').update({ is_active: !item.is_active }).eq('id', item.id)
      if (error) throw error
      toast.success(item.is_active ? 'Hidden' : 'Visible'); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const resetForm = () => setFormData({ title: '', description: '', event_date: '', event_time: '', location: '', category: '', capacity: 0, image_url: '', status: 'upcoming', is_active: true })

  const startEdit = (item) => { setEditingItem(item); setFormData(item); setShowForm(true) }

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }))

  if (loading) return <div style={{ padding: 32, color: TEXT_MUTED, fontFamily: "'Inter', sans-serif" }}>Loading...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: TEXT_PRIMARY }}>Events</h1>
          <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>Manage upcoming and past events</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); resetForm() }}
          style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, color: "#171614", border: "none", borderRadius: 4, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}
        >
          <Plus size={16} /> Add Event
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 24 }}>
          <h2 style={{ color: TEXT_PRIMARY, fontSize: "1.125rem", fontWeight: 600, marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
            {editingItem ? 'Edit' : 'Add'} Event
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Title *</label>
                <input value={formData.title} onChange={e => set('title', e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <input value={formData.category} onChange={e => set('category', e.target.value)} style={inputStyle} placeholder="e.g. Competition, Workshop" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea value={formData.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, resize: "none" }} rows={3} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Event Date *</label>
                <input type="date" value={formData.event_date} onChange={e => set('event_date', e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} required />
              </div>
              <div>
                <label style={labelStyle}>Time</label>
                <input value={formData.event_time} onChange={e => set('event_time', e.target.value)} style={inputStyle} placeholder="e.g. 9:00 AM" />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input value={formData.location} onChange={e => set('location', e.target.value)} style={inputStyle} placeholder="Main Arena" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Capacity</label>
                <input type="number" value={formData.capacity} onChange={e => set('capacity', parseInt(e.target.value))} style={inputStyle} min="0" />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={formData.status} onChange={e => set('status', e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", paddingTop: 22 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 15, height: 15 }} />
                  <span style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>Active / Visible</span>
                </label>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Image URL</label>
              <input type="url" value={formData.image_url} onChange={e => set('image_url', e.target.value)} style={inputStyle} placeholder="https://..." />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" style={{ background: ACCENT, color: "#171614", border: "none", borderRadius: 4, padding: "10px 24px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
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

      {/* Table */}
      <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                {["Title", "Date", "Location", "Capacity", "Status", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", color: TEXT_MUTED, fontSize: "0.6875rem", padding: "12px 16px", fontWeight: 500, fontFamily: "'Inter', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>{item.title}</p>
                    {item.category && <p style={{ color: TEXT_MUTED, fontSize: "0.6875rem" }}>{item.category}</p>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_PRIMARY, fontSize: "0.8125rem" }}>
                      <Calendar size={13} style={{ color: ACCENT }} />
                      {new Date(item.event_date).toLocaleDateString("en-IN")}
                    </div>
                    {item.event_time && <p style={{ color: TEXT_MUTED, fontSize: "0.6875rem", marginTop: 2 }}>{item.event_time}</p>}
                  </td>
                  <td style={{ padding: "12px 16px", color: TEXT_PRIMARY, fontSize: "0.8125rem" }}>{item.location || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_MUTED, fontSize: "0.8125rem" }}>
                      <Users size={13} /> {item.registered_count || 0}/{item.capacity || 0}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{
                        fontSize: "0.6875rem", padding: "3px 8px", borderRadius: 9999, fontWeight: 500, display: "inline-block",
                        background: item.status === 'upcoming' ? "rgba(34,197,94,0.12)" : item.status === 'past' ? "rgba(255,255,255,0.06)" : "rgba(239,68,68,0.12)",
                        color: item.status === 'upcoming' ? "#4ade80" : item.status === 'past' ? TEXT_MUTED : "#f87171",
                      }}>
                        {item.status}
                      </span>
                      <button onClick={() => toggleActive(item)} style={{
                        fontSize: "0.625rem", padding: "2px 8px", borderRadius: 9999, cursor: "pointer", border: "none",
                        background: item.is_active ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                        color: item.is_active ? "#4ade80" : TEXT_MUTED,
                        display: "flex", alignItems: "center", gap: 4, width: "fit-content",
                      }}>
                        {item.is_active ? <><Eye size={10} /> Visible</> : <><EyeOff size={10} /> Hidden</>}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                      <button onClick={() => startEdit(item)} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer" }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: TEXT_MUTED, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
            No events yet. Click "Add Event" to create one.
          </div>
        )}
      </div>
    </div>
  )
}
