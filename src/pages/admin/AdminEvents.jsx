import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, Users } from 'lucide-react'

export default function AdminEvents() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    category: '',
    capacity: 0,
    image_url: '',
    status: 'upcoming',
    is_active: true
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', editingItem.id)
        
        if (error) throw error
        toast.success('Event updated!')
      } else {
        const { error } = await supabase
          .from('events')
          .insert([formData])
        
        if (error) throw error
        toast.success('Event created!')
      }
      
      setShowForm(false)
      setEditingItem(null)
      resetForm()
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Event deleted')
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleActive = async (item) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)
      
      if (error) throw error
      toast.success(item.is_active ? 'Hidden' : 'Visible')
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      category: '',
      capacity: 0,
      image_url: '',
      status: 'upcoming',
      is_active: true
    })
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowForm(true)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1C1006]">Events Management</h1>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); resetForm() }}
          className="flex items-center gap-2 bg-[#9A7650] text-white px-4 py-2 rounded-lg hover:bg-[#8A6640]"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Competition, Workshop, etc."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Date *</label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={e => setFormData({...formData, event_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Time</label>
                <input
                  type="text"
                  value={formData.event_time}
                  onChange={e => setFormData({...formData, event_time: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 9:00 AM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Main Arena"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#9A7650] text-white px-6 py-2 rounded-lg hover:bg-[#8A6640]"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingItem(null); resetForm() }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Capacity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.category}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Calendar size={14} className="inline mr-1" />
                  {new Date(item.event_date).toLocaleDateString()}
                  {item.event_time && <div className="text-xs text-gray-500">{item.event_time}</div>}
                </td>
                <td className="px-4 py-3 text-sm">{item.location}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Users size={14} className="inline mr-1" />
                  {item.registered_count || 0}/{item.capacity || 0}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                      item.status === 'past' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                    <button
                      onClick={() => toggleActive(item)}
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.is_active ? <><Eye size={12} className="inline" /> Visible</> : <><EyeOff size={12} className="inline" /> Hidden</>}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No events yet. Click "Add Event" to create one.
          </div>
        )}
      </div>
    </div>
  )
}
