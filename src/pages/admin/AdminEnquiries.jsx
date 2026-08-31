import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Phone, Mail, Calendar, MessageSquare, Edit2, Send, Check, X } from 'lucide-react'

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
  
  // WhatsApp notification states
  const [selectedContacts, setSelectedContacts] = useState([])
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0 })
  const [generatedLinks, setGeneratedLinks] = useState([])
  const [showLinksView, setShowLinksView] = useState(false)

  useEffect(() => { fetchItems(); fetchEvents() }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setItems(data || [])
    } catch { toast.error('Failed to fetch enquiries') }
    finally { setLoading(false) }
  }

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true })
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
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

  // WhatsApp notification functions
  const toggleContact = (id) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleAllContacts = () => {
    if (selectedContacts.length === filteredItems.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredItems.map(item => item.id))
    }
  }

  const generateLinks = () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact')
      return
    }
    if (!selectedEvent) {
      toast.error('Please select an event')
      return
    }
    
    const event = events.find(e => e.id === selectedEvent)
    const selectedEnquiries = items.filter(item => selectedContacts.includes(item.id))
    
    // Format event date
    const eventDate = new Date(event.event_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    // Create WhatsApp message
    let message = `*${event.title}*\n\n`
    if (event.description) {
      message += `${event.description}\n\n`
    }
    message += `*Date:* ${eventDate}\n`
    if (event.event_time) {
      message += `*Time:* ${event.event_time}\n`
    }
    if (event.location) {
      message += `*Location:* ${event.location}\n`
    }
    message += `\nJoin us for this special event!`
    
    const encodedMessage = encodeURIComponent(message)
    
    // Generate all links
    const links = selectedEnquiries.map(enquiry => {
      const cleanPhone = enquiry.phone.replace(/\D/g, '')
      const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`
      return {
        name: enquiry.name,
        phone: enquiry.phone,
        url: `https://wa.me/${phoneWithCode}?text=${encodedMessage}`
      }
    })
    
    setGeneratedLinks(links)
    setShowLinksView(true)
    toast.success(`Generated ${links.length} WhatsApp links!`)
  }

  const sendWhatsAppNotifications = () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact')
      return
    }
    if (!selectedEvent) {
      toast.error('Please select an event')
      return
    }
    
    const event = events.find(e => e.id === selectedEvent)
    const selectedEnquiries = items.filter(item => selectedContacts.includes(item.id))
    
    // Format event date
    const eventDate = new Date(event.event_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    // Create WhatsApp message without problematic emojis
    let message = `*${event.title}*\n\n`
    if (event.description) {
      message += `${event.description}\n\n`
    }
    message += `*Date:* ${eventDate}\n`
    if (event.event_time) {
      message += `*Time:* ${event.event_time}\n`
    }
    if (event.location) {
      message += `*Location:* ${event.location}\n`
    }
    message += `\nJoin us for this special event!`
    
    const encodedMessage = encodeURIComponent(message)
    
    // Set sending state
    setIsSending(true)
    setSendingProgress({ current: 0, total: selectedEnquiries.length })
    
    // Store contacts and message for sequential sending
    let currentIndex = 0
    
    const sendNext = () => {
      if (currentIndex < selectedEnquiries.length) {
        const enquiry = selectedEnquiries[currentIndex]
        
        // Update progress
        setSendingProgress({ current: currentIndex + 1, total: selectedEnquiries.length })
        
        // Clean phone number (remove spaces, dashes, etc.)
        const cleanPhone = enquiry.phone.replace(/\D/g, '')
        // Add country code if not present (assuming India +91)
        const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`
        const whatsappUrl = `https://wa.me/${phoneWithCode}?text=${encodedMessage}`
        
        console.log(`Opening WhatsApp ${currentIndex + 1}/${selectedEnquiries.length}:`, enquiry.name, phoneWithCode)
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank')
        
        currentIndex++
        
        // Wait 3 seconds before next one (gives time to send and for browser to not block)
        if (currentIndex < selectedEnquiries.length) {
          setTimeout(sendNext, 3000)
        } else {
          // All done
          setTimeout(() => {
            toast.success('All WhatsApp windows opened!', { duration: 4000 })
            setIsSending(false)
            setSendingProgress({ current: 0, total: 0 })
            setShowWhatsAppModal(false)
            setSelectedContacts([])
            setSelectedEvent(null)
          }, 1000)
        }
      }
    }
    
    // Start the sequential sending
    sendNext()
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
      {/* Header with WhatsApp Action */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: TEXT_PRIMARY }}>Enquiries</h1>
          <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>View and manage customer enquiries and demo requests</p>
        </div>
        {selectedContacts.length > 0 && (
          <button 
            onClick={() => setShowWhatsAppModal(true)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              background: "#25D366", 
              color: "#fff", 
              border: "none", 
              borderRadius: 6, 
              padding: "10px 18px", 
              cursor: "pointer", 
              fontWeight: 600, 
              fontSize: "0.875rem", 
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)"
            }}
          >
            <Send size={16} />
            Send via WhatsApp ({selectedContacts.length})
          </button>
        )}
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

      {/* Filters with Select All */}
      <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Select All Checkbox */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: `1px solid ${CARD_BORDER}` }}>
          <input
            type="checkbox"
            checked={selectedContacts.length === filteredItems.length && filteredItems.length > 0}
            onChange={toggleAllContacts}
            style={{ width: 16, height: 16, cursor: "pointer", accentColor: ACCENT }}
          />
          <label style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", cursor: "pointer" }} onClick={toggleAllContacts}>
            Select All ({filteredItems.length} contact{filteredItems.length !== 1 ? 's' : ''})
          </label>
          {selectedContacts.length > 0 && (
            <button
              onClick={() => setSelectedContacts([])}
              style={{ 
                marginLeft: "auto",
                display: "flex", 
                alignItems: "center", 
                gap: 4,
                background: "rgba(239, 68, 68, 0.15)", 
                color: "#f87171", 
                border: "none", 
                borderRadius: 4, 
                padding: "4px 10px", 
                cursor: "pointer", 
                fontSize: "0.75rem", 
                fontFamily: "'Inter', sans-serif" 
              }}
            >
              <X size={12} /> Clear Selection
            </button>
          )}
        </div>
        
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
          const isSelected = selectedContacts.includes(item.id)
          return (
            <div key={item.id} style={{ 
              background: CARD_BG, 
              border: `1px solid ${isSelected ? ACCENT : CARD_BORDER}`, 
              borderRadius: 8, 
              padding: 20,
              boxShadow: isSelected ? `0 0 0 2px ${ACCENT}20` : 'none',
              transition: "all 0.2s"
            }}>
              {/* Top row with checkbox */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleContact(item.id)}
                    style={{ 
                      width: 18, 
                      height: 18, 
                      cursor: "pointer", 
                      accentColor: ACCENT,
                      marginTop: 2
                    }}
                  />
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

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 20
        }} onClick={() => setShowWhatsAppModal(false)}>
          <div 
            style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 12,
              padding: 28,
              maxWidth: 500,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontSize: "1.5rem", 
                fontWeight: 700, 
                color: TEXT_PRIMARY,
                margin: 0
              }}>
                Send Event via WhatsApp
              </h2>
              <button
                onClick={() => {
                  if (!isSending) {
                    setShowWhatsAppModal(false)
                    setSelectedEvent(null)
                  }
                }}
                disabled={isSending}
                style={{
                  background: "none",
                  border: "none",
                  color: isSending ? "rgba(255,255,255,0.3)" : TEXT_MUTED,
                  cursor: isSending ? "not-allowed" : "pointer",
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Contacts Info */}
            <div style={{ 
              background: "rgba(37, 211, 102, 0.1)", 
              border: "1px solid rgba(37, 211, 102, 0.3)",
              borderRadius: 6,
              padding: 12,
              marginBottom: 20
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Check size={16} style={{ color: "#25D366" }} />
                <span style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
                  {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>

            {/* Event Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: "block",
                color: TEXT_MUTED, 
                fontSize: "0.6875rem", 
                letterSpacing: "0.08em", 
                textTransform: "uppercase", 
                marginBottom: 10, 
                fontFamily: "'Inter', sans-serif" 
              }}>
                Select Event
              </label>
              {events.length === 0 ? (
                <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", fontStyle: "italic" }}>
                  No upcoming events available
                </p>
              ) : (
                <select
                  value={selectedEvent || ''}
                  onChange={e => setSelectedEvent(e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    padding: "10px 12px"
                  }}
                >
                  <option value="">Choose an event...</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.event_date).toLocaleDateString('en-IN')}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Event Preview */}
            {selectedEvent && (
              <div style={{ 
                background: "rgba(255,255,255,0.03)", 
                border: `1px solid ${CARD_BORDER}`, 
                borderRadius: 6, 
                padding: 14,
                marginBottom: 20
              }}>
                <p style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
                  Message Preview:
                </p>
                {(() => {
                  const event = events.find(e => e.id === selectedEvent)
                  const eventDate = new Date(event.event_date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                  let previewText = `*${event.title}*\n\n`
                  if (event.description) {
                    previewText += `${event.description}\n\n`
                  }
                  previewText += `*Date:* ${eventDate}\n`
                  if (event.event_time) {
                    previewText += `*Time:* ${event.event_time}\n`
                  }
                  if (event.location) {
                    previewText += `*Location:* ${event.location}\n`
                  }
                  previewText += `\nJoin us for this special event!`
                  
                  return (
                    <div style={{ 
                      color: TEXT_PRIMARY, 
                      fontSize: "0.8125rem", 
                      fontFamily: "'Inter', sans-serif",
                      lineHeight: 1.6,
                      whiteSpace: "pre-line"
                    }}>
                      {previewText}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Progress indicator */}
              {isSending && (
                <div style={{ 
                  background: "rgba(37, 211, 102, 0.1)", 
                  border: "1px solid rgba(37, 211, 102, 0.3)",
                  borderRadius: 6,
                  padding: 12,
                  textAlign: "center"
                }}>
                  <p style={{ color: "#25D366", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                    Opening WhatsApp {sendingProgress.current} of {sendingProgress.total}...
                  </p>
                  <p style={{ color: TEXT_MUTED, fontSize: "0.75rem", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
                    Please don't close this window. Allow popups if prompted.
                  </p>
                </div>
              )}
              
              {/* Links view */}
              {showLinksView && !isSending && (
                <div style={{ 
                  background: "rgba(255,255,255,0.03)", 
                  border: `1px solid ${CARD_BORDER}`, 
                  borderRadius: 6, 
                  padding: 14,
                  maxHeight: 300,
                  overflowY: "auto"
                }}>
                  <p style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 12 }}>
                    Click each link to open WhatsApp:
                  </p>
                  {generatedLinks.map((link, idx) => (
                    <div key={idx} style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 4,
                      marginBottom: 6
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: TEXT_PRIMARY, fontSize: "0.8125rem", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                          {link.name}
                        </p>
                        <p style={{ color: TEXT_MUTED, fontSize: "0.75rem", fontFamily: "'Inter', sans-serif" }}>
                          {link.phone}
                        </p>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#25D366",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 12px",
                          textDecoration: "none",
                          fontSize: "0.75rem",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600
                        }}
                      >
                        <Send size={12} />
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ display: "flex", gap: 10 }}>
                {!showLinksView && (
                  <>
                    <button
                      onClick={sendWhatsAppNotifications}
                      disabled={!selectedEvent || events.length === 0 || isSending}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: (selectedEvent && events.length > 0 && !isSending) ? "#25D366" : "rgba(255,255,255,0.1)",
                        color: (selectedEvent && events.length > 0 && !isSending) ? "#fff" : TEXT_MUTED,
                        border: "none",
                        borderRadius: 6,
                        padding: "12px 20px",
                        cursor: (selectedEvent && events.length > 0 && !isSending) ? "pointer" : "not-allowed",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        fontFamily: "'Inter', sans-serif",
                        opacity: (selectedEvent && events.length > 0 && !isSending) ? 1 : 0.5
                      }}
                    >
                      <Send size={16} />
                      {isSending ? 'Sending...' : 'Auto Send All'}
                    </button>
                    <button
                      onClick={generateLinks}
                      disabled={!selectedEvent || events.length === 0 || isSending}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: (selectedEvent && events.length > 0 && !isSending) ? ACCENT : "rgba(255,255,255,0.1)",
                        color: (selectedEvent && events.length > 0 && !isSending) ? "#171614" : TEXT_MUTED,
                        border: "none",
                        borderRadius: 6,
                        padding: "12px 20px",
                        cursor: (selectedEvent && events.length > 0 && !isSending) ? "pointer" : "not-allowed",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        fontFamily: "'Inter', sans-serif",
                        opacity: (selectedEvent && events.length > 0 && !isSending) ? 1 : 0.5
                      }}
                    >
                      <MessageSquare size={16} />
                      Show Links
                    </button>
                  </>
                )}
                {showLinksView && (
                  <button
                    onClick={() => {
                      setShowLinksView(false)
                      setGeneratedLinks([])
                    }}
                    style={{
                      flex: 1,
                      background: ACCENT,
                      color: "#171614",
                      border: "none",
                      borderRadius: 6,
                      padding: "12px 20px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!isSending) {
                      setShowWhatsAppModal(false)
                      setSelectedEvent(null)
                      setShowLinksView(false)
                      setGeneratedLinks([])
                    }
                  }}
                  disabled={isSending}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: isSending ? TEXT_MUTED : TEXT_PRIMARY,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 6,
                    padding: "12px 20px",
                    cursor: isSending ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    fontFamily: "'Inter', sans-serif",
                    opacity: isSending ? 0.5 : 1
                  }}
                >
                  {isSending ? 'Wait...' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
