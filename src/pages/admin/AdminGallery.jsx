import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Image, Video, Eye, EyeOff } from 'lucide-react'

export default function AdminGallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_url: '',
    media_type: 'image',
    category: '',
    is_active: true,
    display_order: 0
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      toast.error('Failed to fetch gallery items')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('gallery')
          .update(formData)
          .eq('id', editingItem.id)
        
        if (error) throw error
        toast.success('Gallery item updated!')
      } else {
        const { error } = await supabase
          .from('gallery')
          .insert([formData])
        
        if (error) throw error
        toast.success('Gallery item created!')
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
    if (!confirm('Delete this gallery item?')) return
    
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Gallery item deleted')
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleActive = async (item) => {
    try {
      const { error } = await supabase
        .from('gallery')
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
      media_url: '',
      media_type: 'image',
      category: '',
      is_active: true,
      display_order: 0
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
        <h1 className="text-2xl font-bold text-[#1C1006]">Gallery Management</h1>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); resetForm() }}
          className="flex items-center gap-2 bg-[#9A7650] text-white px-4 py-2 rounded-lg hover:bg-[#8A6640]"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Gallery Item</h2>
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
                  placeholder="e.g., Events, Training, Facilities"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Media URL *</label>
                <input
                  type="url"
                  value={formData.media_url}
                  onChange={e => setFormData({...formData, media_url: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Media Type *</label>
                <select
                  value={formData.media_type}
                  onChange={e => setFormData({...formData, media_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={e => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active (Visible to public)</span>
                </label>
              </div>
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
              <th className="px-4 py-3 text-left text-sm font-semibold">Preview</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Order</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {item.media_type === 'image' ? (
                    <img src={item.media_url} alt={item.title} className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <Video size={24} className="text-gray-500" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{item.title}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {item.media_type === 'image' ? (
                    <Image size={16} className="inline mr-1" />
                  ) : (
                    <Video size={16} className="inline mr-1" />
                  )}
                  {item.media_type}
                </td>
                <td className="px-4 py-3 text-sm">{item.display_order}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.is_active ? (
                      <><Eye size={14} className="inline mr-1" />Visible</>
                    ) : (
                      <><EyeOff size={14} className="inline mr-1" />Hidden</>
                    )}
                  </button>
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
            No gallery items yet. Click "Add Item" to create one.
          </div>
        )}
      </div>
    </div>
  )
}
