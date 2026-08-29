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

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1006]">Testimonials Management</h1>
          <p className="text-sm text-gray-600 mt-1">Review and approve customer testimonials</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); resetForm() }}
          className="flex items-center gap-2 bg-[#9A7650] text-white px-4 py-2 rounded-lg hover:bg-[#8A6640]"
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
                ? 'bg-[#9A7650] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Testimonial</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role/Designation</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Member since 2022"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Review *</label>
              <textarea
                value={formData.review}
                onChange={e => setFormData({...formData, review: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating *</label>
                <select
                  value={formData.rating}
                  onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={e => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="space-y-2 pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_approved}
                    onChange={e => setFormData({...formData, is_approved: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Approved</span>
                </label>
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
              <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://... or leave blank for avatar"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6 relative">
            {/* Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-1">
              {item.is_approved ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} />
                  Approved
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <XCircle size={12} />
                  Pending
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex gap-1 mb-3">
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} size={16} fill="#9A7650" stroke="none" />
              ))}
            </div>

            {/* Review */}
            <p className="text-sm text-gray-700 mb-4 line-clamp-3">"{item.review}"</p>

            {/* Author */}
            <div className="mb-4 pb-4 border-b">
              <p className="font-medium text-gray-900">{item.name}</p>
              {item.role && <p className="text-xs text-gray-500">{item.role}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => toggleApproval(item)}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    item.is_approved
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  {item.is_approved ? 'Approved' : 'Approve'}
                </button>
                <button
                  onClick={() => toggleActive(item)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.is_active ? <Eye size={12} className="inline" /> : <EyeOff size={12} className="inline" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No {filter !== 'all' && filter} testimonials yet.
        </div>
      )}
    </div>
  )
}
