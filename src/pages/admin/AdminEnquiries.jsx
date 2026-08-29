import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Phone, Mail, Calendar, MessageSquare, Edit2 } from 'lucide-react'

export default function AdminEnquiries() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [editingNotes, setEditingNotes] = useState(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      toast.error('Failed to fetch enquiries')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      toast.success('Status updated!')
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const saveNotes = async (id) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ notes })
        .eq('id', id)
      
      if (error) throw error
      toast.success('Notes saved!')
      setEditingNotes(null)
      setNotes('')
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const startEditNotes = (item) => {
    setEditingNotes(item.id)
    setNotes(item.notes || '')
  }

  const types = ['all', 'general', 'demo', 'package', 'event']
  const statuses = ['all', 'new', 'contacted', 'converted', 'closed']

  const filteredItems = items.filter(item => {
    const typeMatch = selectedType === 'all' || item.enquiry_type === selectedType
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus
    return typeMatch && statusMatch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'converted': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'general': return 'bg-purple-100 text-purple-800'
      case 'demo': return 'bg-orange-100 text-orange-800'
      case 'package': return 'bg-pink-100 text-pink-800'
      case 'event': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1C1006]">Enquiries Management</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage customer enquiries and demo requests</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statuses.filter(s => s !== 'all').map(status => (
          <div key={status} className="bg-white rounded-lg shadow-sm p-4 border-l-4" style={{
            borderColor: status === 'new' ? '#3B82F6' : status === 'contacted' ? '#F59E0B' : status === 'converted' ? '#10B981' : '#6B7280'
          }}>
            <p className="text-2xl font-bold text-gray-900">
              {items.filter(i => i.status === status).length}
            </p>
            <p className="text-sm text-gray-600 capitalize">{status}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Type:</label>
            <div className="flex gap-2 flex-wrap">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-lg text-sm capitalize ${
                    selectedType === type
                      ? 'bg-[#9A7650] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                  {type !== 'all' && (
                    <span className="ml-1">({items.filter(i => i.enquiry_type === type).length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Status:</label>
            <div className="flex gap-2 flex-wrap">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 rounded-lg text-sm capitalize ${
                    selectedStatus === status
                      ? 'bg-[#9A7650] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                  {status !== 'all' && (
                    <span className="ml-1">({items.filter(i => i.status === status).length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="space-y-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(item.enquiry_type)}`}>
                    {item.enquiry_type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Received: {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:border-[#9A7650]"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{item.phone}</span>
              </div>
              {item.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  <span>{item.email}</span>
                </div>
              )}
              {item.preferred_date && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{new Date(item.preferred_date).toLocaleDateString()}</span>
                  {item.preferred_time && <span className="text-xs">@ {item.preferred_time}</span>}
                </div>
              )}
            </div>

            {item.message && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Message:</span>
                </div>
                <p className="text-sm text-gray-600">{item.message}</p>
              </div>
            )}

            {/* Notes Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Admin Notes:</span>
                <button
                  onClick={() => startEditNotes(item)}
                  className="text-sm text-[#9A7650] hover:text-[#8A6640] flex items-center gap-1"
                >
                  <Edit2 size={14} />
                  {item.notes ? 'Edit' : 'Add'} Notes
                </button>
              </div>
              
              {editingNotes === item.id ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Add internal notes..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveNotes(item.id)}
                      className="bg-[#9A7650] text-white px-4 py-1 rounded-lg text-sm hover:bg-[#8A6640]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingNotes(null); setNotes('') }}
                      className="bg-gray-200 text-gray-700 px-4 py-1 rounded-lg text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">
                  {item.notes || 'No notes added yet'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No enquiries found with the selected filters.
        </div>
      )}
    </div>
  )
}
