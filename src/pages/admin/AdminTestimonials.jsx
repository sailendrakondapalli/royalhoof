import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Star, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'

export default function AdminTestimonials() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, approved
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 5,
    review: '',
    image_url: '',
    is_approved: false,
    is_active: true,
    display_order: 0
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      toast.error('Failed to fetch testimonials')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('testimonials')
          .update(formData)
          .eq('id', editingItem.id)
        
        if (error) throw error
        toast.success('Testimonial updated!')
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([formData])
        
        if (error) throw error
        toast.success('Testimonial created!')
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
    if (!confirm('Delete this testimonial?')) return
    
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Testimonial deleted')
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleApproval = async (item) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: !item.is_approved })
        .eq('id', item.id)
      
      if (error) throw error
      toast.success(item.is_approved ? 'Unapproved' : 'Approved!')
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleActive = async (item) => {
    try {
      const { error } = await supabase
        .from('testimonials')
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
      name: '',
      role: '',
      rating: 5,
      review: '',
      image_url: '',
      is_approved: false,
      is_active: true,
      display_order: 0
    })
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowForm(true)
  }

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.is_approved
    if (filter === 'approved') return item.is_approved
    return true
  })

  if (loading) return <div className="p-8 bg-[#1A1A1A] text-[#F3F4F6]">Loading...</div>

  return (
    <div className="p-6 bg-[#1A1A1A] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6]">Testimonials Management</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Review and approve customer testimonials</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); resetForm() }}
          className="flex items-center gap-2 bg-[#D8C7AE] text-[#1A1A1A] px-4 py-2 rounded-lg hover:bg-[#E5D4C1] transition-colors font-medium"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-[#D8C7AE] text-[#1A1A1A]'
                : 'bg-[#374151] text-[#D1D5DB] hover:bg-[#4B5563]'
            }`}
          >
            {tab}
            {tab !== 'all' && (
              <span className="ml-2 text-xs">
                ({items.filter(i => tab === 'pending' ? !i.is_approved : i.is_approved).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-[#2D2D2D] border border-[#374151] rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#F3F4F6]">{editingItem ? 'Edit' : 'Add'} Testimonial</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#E5E7EB]">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-[#374151] bg-[#1F2937] text-[#F3F4F6] rounded-lg px-3 py-2 focus:outline-none focus:border-[#D8C7AE] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#E5E7EB]">Role/Designation</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full border border-[#374151] bg-[#1F2937] text-[#F3F4F6] rounded-lg px-3 py-2 focus:outline-none focus:border-[#D8C7AE] transition-colors"
                  placeholder="e.g., Member since 2022"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[#E5E7EB]">Review *</label>
              <textarea
                value={formData.review}
                onChange={e => setFormData({...formData, review: e.target.value})}
                className="w-full border border-[#374151] bg-[#1F2937] text-[#F3F4F6] rounded-lg px-3 py-2 focus:outline-none focus:border-[#D8C7AE] transition-colors"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#E5E7EB]">Rating *</label>
                <select
                  value={formData.rating}
                  onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})}
                  className="w-full border border-[#374151] bg-[#1F2937] text-[#F3F4F6] rounded-lg px-3 py-2 focus:outline-none focus:border-[#D8C7AE]"
                >
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#E5E7EB]">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={e => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  className="w-full border border-[#374151] bg-[#1F2937] text-[#F3F4F6] rounded-lg px-3 py-2 focus:outline-none focus:border-[#D8C7AE] transition-colors"
                />
              </div>
              <div className="space-y-2 pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_approved}
                    onChange={e => setFormData({...formData, is_approved: e.target.checked})}
                    className="w-4 h-4 text-[#D8C7AE] focus:ring-[#D8C7AE] border-[#374151] bg-[#1F2937]"
                  />
                  <span className="text-sm font-medium text-[#E5E7EB]">Approved</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 text-[#D8C7AE] focus:ring-[#D8C7AE] border-[#374151] bg-[#1F2937]"
                  />
                  <span className="text-sm font-medium text-[#E5E7EB]">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[#E5E7EB]">Image URL (optional)</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
                className="w-full border border-[#374151] bg-[#1F2937] text-[#F3F4F6] rounded-lg px-3 py-2 focus:outline-none focus:border-[#D8C7AE] transition-colors"
                placeholder="https://... or leave blank for avatar"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#D8C7AE] text-[#1A1A1A] px-6 py-2 rounded-lg hover:bg-[#E5D4C1] transition-colors font-medium"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingItem(null); resetForm() }}
                className="bg-[#374151] text-[#D1D5DB] px-6 py-2 rounded-lg hover:bg-[#4B5563] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-[#2D2D2D] border border-[#374151] rounded-lg shadow-lg p-6 relative">
            {/* Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-1">
              {item.is_approved ? (
                <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-green-700/30">
                  <CheckCircle size={12} />
                  Approved
                </span>
              ) : (
                <span className="bg-yellow-900/30 text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-yellow-700/30">
                  <XCircle size={12} />
                  Pending
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex gap-1 mb-3">
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} size={16} fill="#D8C7AE" stroke="none" />
              ))}
            </div>

            {/* Review */}
            <p className="text-sm text-[#D1D5DB] mb-4 line-clamp-3">"{item.review}"</p>

            {/* Author */}
            <div className="mb-4 pb-4 border-b border-[#374151]">
              <p className="font-medium text-[#F3F4F6]">{item.name}</p>
              {item.role && <p className="text-xs text-[#9CA3AF]">{item.role}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => toggleApproval(item)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    item.is_approved
                      ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50 border border-green-700/30'
                      : 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 border border-yellow-700/30'
                  }`}
                >
                  {item.is_approved ? 'Approved' : 'Approve'}
                </button>
                <button
                  onClick={() => toggleActive(item)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    item.is_active 
                      ? 'bg-green-900/30 text-green-400 border border-green-700/30' 
                      : 'bg-gray-700 text-gray-400 border border-gray-600'
                  }`}
                >
                  {item.is_active ? <Eye size={12} className="inline" /> : <EyeOff size={12} className="inline" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-[#2D2D2D] border border-[#374151] rounded-lg shadow-lg p-12 text-center text-[#9CA3AF]">
          No {filter !== 'all' && filter} testimonials yet.
        </div>
      )}
    </div>
  )
}
