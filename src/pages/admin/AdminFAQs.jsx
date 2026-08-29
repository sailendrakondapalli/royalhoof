import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'

export default function AdminFAQs() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: '',
    is_active: true,
    display_order: 0
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('category, display_order', { ascending: true })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      toast.error('Failed to fetch FAQs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', editingItem.id)
        
        if (error) throw error
        toast.success('FAQ updated!')
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([formData])
        
        if (error) throw error
        toast.success('FAQ created!')
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
    if (!confirm('Delete this FAQ?')) return
    
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('FAQ deleted')
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleActive = async (item) => {
    try {
      const { error } = await supabase
        .from('faqs')
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
      category: '',
      question: '',
      answer: '',
      is_active: true,
      display_order: 0
    })
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowForm(true)
  }

  const categories = ['all', ...new Set(items.map(item => item.category))]
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1C1006]">FAQs Management</h1>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); resetForm() }}
          className="flex items-center gap-2 bg-[#9A7650] text-white px-4 py-2 rounded-lg hover:bg-[#8A6640]"
        >
          <Plus size={20} />
          Add FAQ
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              selectedCategory === cat
                ? 'bg-[#9A7650] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
            {cat !== 'all' && (
              <span className="ml-2 text-xs">
                ({items.filter(i => i.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} FAQ</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., General, Membership, Payment"
                  required
                />
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Question *</label>
              <input
                type="text"
                value={formData.question}
                onChange={e => setFormData({...formData, question: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="What is your question?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Answer *</label>
              <textarea
                value={formData.answer}
                onChange={e => setFormData({...formData, answer: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={4}
                placeholder="Provide a detailed answer..."
                required
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

      <div className="space-y-6">
        {Object.keys(groupedItems).map(category => (
          <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b">
              <h3 className="text-lg font-semibold text-[#1C1006]">{category}</h3>
            </div>
            <div className="divide-y">
              {groupedItems[category].map(item => (
                <div key={item.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{item.question}</h4>
                        {!item.is_active && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{item.answer}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Order: {item.display_order}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`p-2 rounded-lg ${
                          item.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={item.is_active ? 'Hide' : 'Show'}
                      >
                        {item.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No FAQs yet. Click "Add FAQ" to create one.
        </div>
      )}
    </div>
  )
}
