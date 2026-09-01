import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Image, Video, Eye, EyeOff } from 'lucide-react'

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

export default function AdminGallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '', description: '', media_url: '', media_type: 'image',
    category: '', is_active: true, display_order: 0
  })

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('gallery').select('*').order('display_order', { ascending: true })
      if (error) throw error
      setItems(data || [])
    } catch { toast.error('Failed to fetch gallery items') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        const { error } = await supabase.from('gallery').update(formData).eq('id', editingItem.id)
        if (error) throw error
        toast.success('Updated!')
      } else {
        const { error } = await supabase.from('gallery').insert([formData])
        if (error) throw error
        toast.success('Added!')
      }
      setShowForm(false); setEditingItem(null); resetForm(); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this gallery item?')) return
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id)
      if (error) throw error
      toast.success('Deleted'); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const toggleActive = async (item) => {
    try {
      const { error } = await supabase.from('gallery').update({ is_active: !item.is_active }).eq('id', item.id)
      if (error) throw error
      toast.success(item.is_active ? 'Hidden' : 'Visible'); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const resetForm = () => setFormData({ title: '', description: '', media_url: '', media_type: 'image', category: '', is_active: true, display_order: 0 })
  const startEdit = (item) => { setEditingItem(item); setFormData(item); setShowForm(true) }
  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }))

  if (loading) return <div style={{ padding: 32, color: TEXT_MUTED, fontFamily: "'Inter', sans-serif" }}>Loading...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: TEXT_PRIMARY }}>Gallery</h1>
          <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>Manage photos and videos</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingItem(null); resetForm() }}
          style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, color: "#5B1E28", border: "none", borderRadius: 4, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 24 }}>
          <h2 style={{ color: TEXT_PRIMARY, fontSize: "1.125rem", fontWeight: 600, marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
            {editingItem ? 'Edit' : 'Add'} Gallery Item
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Title *</label>
                <input value={formData.title} onChange={e => set('title', e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <input value={formData.category} onChange={e => set('category', e.target.value)} style={inputStyle} placeholder="e.g. Events, Training, Facilities" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={formData.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, resize: "none" }} rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Media URL *</label>
                <input type="url" value={formData.media_url} onChange={e => set('media_url', e.target.value)} style={inputStyle} placeholder="https://..." required />
              </div>
              <div>
                <label style={labelStyle}>Media Type</label>
                <select value={formData.media_type} onChange={e => set('media_type', e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Display Order</label>
                <input type="number" value={formData.display_order} onChange={e => set('display_order', parseInt(e.target.value))} style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 15, height: 15 }} />
                  <span style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>Active / Visible</span>
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

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, overflow: "hidden" }}>
            {/* Preview */}
            <div style={{ width: "100%", aspectRatio: "16/10", overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
              {item.media_type === 'image' ? (
                <img src={item.media_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Video size={28} style={{ color: TEXT_MUTED }} />
                </div>
              )}
            </div>
            {/* Info */}
            <div style={{ padding: "12px" }}>
              <p style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontWeight: 500, fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>{item.title}</p>
              {item.category && (
                <span style={{ fontSize: "0.6875rem", padding: "2px 8px", borderRadius: 9999, background: "rgba(216,199,174,0.1)", color: ACCENT, display: "inline-block", marginBottom: 8 }}>
                  {item.category}
                </span>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: `1px solid ${CARD_BORDER}` }}>
                <button onClick={() => toggleActive(item)} style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: "0.6875rem", cursor: "pointer",
                  background: "none", border: "none", padding: 0,
                  color: item.is_active ? "#4ade80" : TEXT_MUTED,
                }}>
                  {item.is_active ? <><Eye size={12} /> Visible</> : <><EyeOff size={12} /> Hidden</>}
                </button>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => startEdit(item)} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer" }}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(item.id)} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: "48px", textAlign: "center", color: TEXT_MUTED, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
          No gallery items yet. Click "Add Item" to create one.
        </div>
      )}
    </div>
  )
}
