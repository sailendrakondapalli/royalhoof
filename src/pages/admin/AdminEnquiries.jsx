import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Phone, Mail, Calendar, MessageSquare, Edit2 } from 'lucide-react'

const CARD_BG = "#242120"
const CARD_BORDER = "rgba(255,255,255,0.07)"
const TEXT_PRIMARY = "#F3EBDD"
const TEXT_MUTED = "rgba(243,235,221,0.45)"
const ACCENT = "#D8C7AE"

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 5,
  padding: "8px 12px",
  color: TEXT_PRIMARY,
  fontSize: "0.875rem",
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
}

export default function AdminEnquiries() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [editingNotes, setEditingNotes] = useState(null)
  const [notes, setNotes] = useState('')

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setItems(data || [])
    } catch { toast.error('Failed to fetch enquiries') }
    finally { setLoading(false) }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('enquiries').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      toast.success('Status updated!'); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const saveNotes = async (id) => {
    try {
      const { error } = await supabase.from('enquiries').update({ notes }).eq('id', id)
      if (error) throw error
      toast.success('Notes saved!'); setEditingNotes(null); setNotes(''); fetchItems()
    } catch (err) { toast.error(err.message) }
  }

  const types = ['all', 'general', 'demo', 'package', 'event']
  const statuses = ['all', 'new', 'contacted', 'converted', 'closed']

  const filteredItems = items.filter(item => {
    const typeMatch = selectedType === 'all' || item.enquiry_type === selectedType
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus
    return typeMatch && statusMatch
  })

  const statusColor = (s) => ({
    new: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
    contacted: { bg: "rgba(234,179,8,0.12)", color: "#fbbf24" },
    converted: { bg: "rgba(34,197,94,0.12)", color: "#4ade80" },
    closed: { bg: "rgba(255,255,255,0.06)", color: TEXT_MUTED },
  }[s] || { bg: "rgba(255,255,255,0.06)", color: TEXT_MUTED })

  const typeColor = (t) => ({
    general: { bg: "rgba(168,85,247,0.12)", color: "#c084fc" },
    demo: { bg: "rgba(249,115,22,0.12)", color: "#fb923c" },
    package: { bg: "rgba(236,72,153,0.12)", color: "#f472b6" },
    event: { bg: "rgba(6,182,212,0.12)", color: "#22d3ee" },
  }[t] || { bg: "rgba(255,255,255,0.06)", color: TEXT_MUTED })

  if (loading) return <div style={{ padding: 32, color: TEXT_MUTED, fontFamily: "'Inter', sans-serif" }}>Loading...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: TEXT_PRIMARY }}>Enquiries</h1>
        <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>View and manage customer enquiries and demo requests</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.filter(s => s !== 'all').map(status => {
          const c = statusColor(status)
          const count = items.filter(i => i.status === status).length
          return (
            <div key={status} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: "16px 20px", borderLeft: `3px solid ${c.color}` }}>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Inter', sans-serif" }}>{count}</p>
              <p style={{ fontSize: "0.8125rem", color: TEXT_MUTED, marginTop: 2, textTransform: "capitalize", fontFamily: "'Inter', sans-serif" }}>{status}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p style={{ color: TEXT_MUTED, fontSize: "0.6875rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>Type</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {types.map(type => (
                <button key={type} onClick={() => setSelectedType(type)} style={{
                  padding: "5px 12px", borderRadius: 4, fontSize: "0.8125rem", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", border: "1px solid",
                  background: selectedType === type ? ACCENT : "transparent",
                  color: selectedType === type ? "#171614" : TEXT_MUTED,
                  borderColor: selectedType === type ? ACCENT : CARD_BORDER,
                  textTransform: "capitalize",
                }}>
                  {type}
                  {type !== 'all' && <span style={{ marginLeft: 4, opacity: 0.7 }}>({items.filter(i => i.enquiry_type === type).length})</span>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: TEXT_MUTED, fontSize: "0.6875rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>Status</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {statuses.map(status => (
                <button key={status} onClick={() => setSelectedStatus(status)} style={{
                  padding: "5px 12px", borderRadius: 4, fontSize: "0.8125rem", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", border: "1px solid",
                  background: selectedStatus === status ? ACCENT : "transparent",
                  color: selectedStatus === status ? "#171614" : TEXT_MUTED,
                  borderColor: selectedStatus === status ? ACCENT : CARD_BORDER,
                  textTransform: "capitalize",
                }}>
                  {status}
                  {status !== 'all' && <span style={{ marginLeft: 4, opacity: 0.7 }}>({items.filter(i => i.status === status).length})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredItems.map(item => {
          const sc = statusColor(item.status)
          const tc = typeColor(item.enquiry_type)
          return (
            <div key={item.id} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 20 }}>
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <h3 style={{ color: TEXT_PRIMARY, fontSize: "1rem", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{item.name}</h3>
                    <span style={{ fontSize: "0.6875rem", padding: "2px 8px", borderRadius: 9999, background: tc.bg, color: tc.color, textTransform: "capitalize" }}>
                      {item.enquiry_type}
                    </span>
                    <span style={{ fontSize: "0.6875rem", padding: "2px 8px", borderRadius: 9999, background: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={{ color: TEXT_MUTED, fontSize: "0.6875rem", fontFamily: "'Inter', sans-serif" }}>
                    {new Date(item.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <select
                  value={item.status}
                  onChange={e => updateStatus(item.id, e.target.value)}
                  style={{ ...inputStyle, width: "auto", cursor: "pointer", padding: "6px 10px" }}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: TEXT_PRIMARY, fontSize: "0.875rem" }}>
                  <Phone size={14} style={{ color: ACCENT, flexShrink: 0 }} /> {item.phone}
                </div>
                {item.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: TEXT_PRIMARY, fontSize: "0.875rem" }}>
                    <Mail size={14} style={{ color: ACCENT, flexShrink: 0 }} /> {item.email}
                  </div>
                )}
                {item.preferred_date && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: TEXT_MUTED, fontSize: "0.875rem" }}>
                    <Calendar size={14} style={{ color: ACCENT, flexShrink: 0 }} />
                    {new Date(item.preferred_date).toLocaleDateString("en-IN")}
                    {item.preferred_time && <span> @ {item.preferred_time}</span>}
                  </div>
                )}
              </div>

              {/* Message */}
              {item.message && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${CARD_BORDER}`, borderRadius: 6, padding: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <MessageSquare size={13} style={{ color: ACCENT }} />
                    <span style={{ color: TEXT_MUTED, fontSize: "0.75rem", fontFamily: "'Inter', sans-serif" }}>Message</span>
                  </div>
                  <p style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>{item.message}</p>
                </div>
              )}

              {/* Notes */}
              <div style={{ borderTop: `1px solid ${CARD_BORDER}`, paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: TEXT_MUTED, fontSize: "0.75rem", fontFamily: "'Inter', sans-serif" }}>Admin Notes</span>
                  <button onClick={() => { setEditingNotes(item.id); setNotes(item.notes || '') }}
                    style={{ display: "flex", alignItems: "center", gap: 4, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Inter', sans-serif" }}>
                    <Edit2 size={12} /> {item.notes ? 'Edit' : 'Add'} Notes
                  </button>
                </div>
                {editingNotes === item.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <textarea
                      value={notes} onChange={e => setNotes(e.target.value)}
                      style={{ ...inputStyle, resize: "none" }} rows={3} placeholder="Add internal notes..."
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => saveNotes(item.id)}
                        style={{ background: ACCENT, color: "#171614", border: "none", borderRadius: 4, padding: "6px 16px", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem", fontFamily: "'Inter', sans-serif" }}>
                        Save
                      </button>
                      <button onClick={() => { setEditingNotes(null); setNotes('') }}
                        style={{ background: "rgba(255,255,255,0.06)", color: TEXT_MUTED, border: `1px solid ${CARD_BORDER}`, borderRadius: 4, padding: "6px 16px", cursor: "pointer", fontSize: "0.8125rem", fontFamily: "'Inter', sans-serif" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: item.notes ? TEXT_PRIMARY : TEXT_MUTED, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", fontStyle: item.notes ? "normal" : "italic" }}>
                    {item.notes || 'No notes yet'}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: "48px", textAlign: "center", color: TEXT_MUTED, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
          No enquiries found with the selected filters.
        </div>
      )}
    </div>
  )
}
