import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Star, Eye, EyeOff } from 'lucide-react'

export default function AdminPackages() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [features, setFeatures] = useState([''])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 'month',
    package_type: 'adult',
    age_group: '',
    features: [],
    is_popular: false,
    is_active: true,
    display_order: 0
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('display_order', { ascending: true })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      toast.error('Failed to fetch packages')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const packageData = {
      ...formData,
      features: features.filter(f => f.trim() !== '')
    }
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('packages')
          .update(packageData)
          .eq('id', editingItem.id)
        
        if (error) throw error
        toast.success('Package updated!')
      } else {
        const { error } = await supabase
          .from('packages')
          .insert([packageData])
        
        if (error) throw error
        toast.success('Package created!')
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
    if (!confirm('Delete this package?')) return
    
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Package deleted')
      fetchItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleActive = async (item) => {
    try {
      const { error } = await supabase
        .from('packages')
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
      description: '',
      price: 0,
      duration: 'month',
      package_type: 'adult',
      age_group: '',
      features: [],
      is_popular: false,
      is_active: true,
      display_order: 0
    })
    setFeatures([''])
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setFeatures(item.features && item.features.length > 0 ? item.features : [''])
    setShowForm(true)
  }

  const addFeature = () => {
    setFeatures([...features, ''])
  }

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index, value) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1C1006]">Packages Management</h1>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); resetForm() }}
          className="flex items-center gap-2 bg-[#9A7650] text-white px-4 py-2 rounded-lg hover:bg-[#8A6640]"
        >
          <Plus size={20} />
          Add Package
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Package</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Package Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Package Type *</label>
                <select
                  value={formData.package_type}
                  onChange={e => setFormData({...formData, package_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="adult">Adult</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration *</label>
                <select
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="month">Month</option>
                  <option value="quarter">Quarter (3 months)</option>
                  <option value="6 months">6 Months</option>
                  <option value="year">Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Age Group (for kids)</label>
                <input
                  type="text"
                  value={formData.age_group}
                  onChange={e => setFormData({...formData, age_group: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 5-12 years"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Features</label>
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={e => updateFeature(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter feature"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-[#9A7650] text-sm hover:text-[#8A6640]"
              >
                + Add Feature
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={e => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={e => setFormData({...formData, is_popular: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Mark as Popular</span>
                </label>
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
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6 relative">
            {item.is_popular && (
              <div className="absolute top-4 right-4">
                <Star size={20} fill="#9A7650" className="text-[#9A7650]" />
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">{item.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.package_type === 'adult' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {item.package_type}
              </span>
              {item.age_group && <span className="text-xs text-gray-500 ml-2">{item.age_group}</span>}
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-[#9A7650]">₹{item.price.toLocaleString()}</span>
              <span className="text-sm text-gray-500">/{item.duration}</span>
            </div>

            {item.description && (
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
            )}

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Features:</p>
              <ul className="text-sm space-y-1">
                {item.features && item.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="text-gray-600">• {feature}</li>
                ))}
                {item.features && item.features.length > 3 && (
                  <li className="text-gray-400 text-xs">+{item.features.length - 3} more</li>
                )}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={() => toggleActive(item)}
                className={`text-xs px-3 py-1 rounded-full ${
                  item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {item.is_active ? <><Eye size={12} className="inline" /> Visible</> : <><EyeOff size={12} className="inline" /> Hidden</>}
              </button>
              
              <div className="flex gap-2">
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
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No packages yet. Click "Add Package" to create one.
        </div>
      )}
    </div>
  )
}
