# Remaining Admin Pages - Quick Implementation

## ✅ Created So Far:
1. AdminGallery.jsx ✓
2. AdminEvents.jsx ✓
3. AdminPackages.jsx ✓

## 📝 Still Need to Create:

### 1. AdminTestimonials.jsx
Key features:
- Approval workflow (Approve/Reject buttons)
- Fields: name, role, rating (1-5), review, image_url, is_approved
- Filter by approved/pending

### 2. AdminFAQs.jsx
Key features:
- Category grouping
- Fields: category, question, answer, display_order
- Easy reordering

### 3. AdminEnquiries.jsx
Key features:
- View all enquiries from forms
- Fields: name, email, phone, enquiry_type, message, status
- Status management (new/contacted/converted/closed)
- Add notes field

## 🔧 Update Required Files:

### 1. Update `src/components/admin/AdminLayout.jsx`

Add these imports at the top:
```jsx
import { Image, Calendar, Tag, Star, HelpCircle, MessageSquare } from 'lucide-react'
```

Add these menu items in the navItems array:
```jsx
const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  
  // ADD THESE:
  { path: '/admin/gallery', label: 'Gallery', icon: Image },
  { path: '/admin/events', label: 'Events', icon: Calendar },
  { path: '/admin/packages', label: 'Packages', icon: Tag },
  { path: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { path: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { path: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  
  { path: '/admin/banners', label: 'Banners', icon: Image },
  // ... rest of existing items
]
```

### 2. Update `src/App.jsx`

Add lazy imports:
```jsx
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'))
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'))
const AdminPackages = lazy(() => import('./pages/admin/AdminPackages'))
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'))
const AdminFAQs = lazy(() => import('./pages/admin/AdminFAQs'))
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries'))
```

Add routes in the admin section:
```jsx
<Route path="admin/*" element={
  <AdminRoute>
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          
          {/* ADD THESE ROUTES */}
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="faqs" element={<AdminFAQs />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          
          <Route path="banners" element={<AdminBanners />} />
          {/* ... rest of routes */}
        </Routes>
      </Suspense>
    </AdminLayout>
  </AdminRoute>
} />
```

## 🎯 Quick Template for Remaining Pages

Copy AdminGallery.jsx and modify for each page:

### For AdminTestimonials.jsx:
```jsx
// Replace table name: 'gallery' → 'testimonials'
// Add approval buttons in the actions column
// Add filter tabs: All | Pending | Approved
```

### For AdminFAQs.jsx:
```jsx
// Replace table name: 'gallery' → 'faqs'
// Group by category in display
// Show category filter dropdown
```

### For AdminEnquiries.jsx:
```jsx
// Replace table name: 'gallery' → 'enquiries'
// Make it read-only (no create, just view/update status)
// Add status dropdown: new/contacted/converted/closed
// Add notes field
// Filter by enquiry_type
```

## 🔗 Connect Frontend to Database

### Update GalleryPage.jsx:
```jsx
useEffect(() => {
  const fetchGallery = async () => {
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    setGalleryItems(data || [])
  }
  fetchGallery()
}, [])
```

### Update EventsPage.jsx:
```jsx
useEffect(() => {
  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('event_date')
    
    setUpcomingEvents(data.filter(e => e.status === 'upcoming'))
    setPastEvents(data.filter(e => e.status === 'past'))
  }
  fetchEvents()
}, [])
```

### Update PackagesPage.jsx:
```jsx
useEffect(() => {
  const fetchPackages = async () => {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    
    setAdultPackages(data.filter(p => p.package_type === 'adult'))
    setKidsPackages(data.filter(p => p.package_type === 'kids'))
  }
  fetchPackages()
}, [])
```

### Update TestimonialsPage.jsx:
```jsx
useEffect(() => {
  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .eq('is_active', true)
      .order('display_order')
    setTestimonials(data || [])
  }
  fetchTestimonials()
}, [])
```

### Update FAQPage.jsx:
```jsx
useEffect(() => {
  const fetchFAQs = async () => {
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('category, display_order')
    
    // Group by category
    const grouped = data.reduce((acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = { category: faq.category, questions: [] }
      acc[faq.category].questions.push({ q: faq.question, a: faq.answer })
      return acc
    }, {})
    
    setFaqsByCategory(Object.values(grouped))
  }
  fetchFAQs()
}, [])
```

### Update EnquiryPage.jsx - Save to DB:
```jsx
const handleEnquirySubmit = async (e) => {
  e.preventDefault()
  
  // Save to database first
  await supabase.from('enquiries').insert([{
    name: enquiryForm.name,
    email: enquiryForm.email,
    phone: enquiryForm.phone,
    message: enquiryForm.message,
    enquiry_type: 'general'
  }])
  
  // Then open WhatsApp
  const text = `*General Enquiry*\n\nName: ${enquiryForm.name}...`
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
  
  toast.success('Enquiry submitted!')
}

const handleDemoSubmit = async (e) => {
  e.preventDefault()
  
  // Save to database
  await supabase.from('enquiries').insert([{
    name: demoForm.name,
    email: demoForm.email,
    phone: demoForm.phone,
    preferred_date: demoForm.date,
    preferred_time: demoForm.time,
    message: demoForm.notes,
    enquiry_type: 'demo'
  }])
  
  // Then WhatsApp...
}
```

## ✅ Testing Checklist

1. [ ] Run academy-admin-setup.sql in Supabase
2. [ ] Create remaining 3 admin pages
3. [ ] Update AdminLayout navigation
4. [ ] Update App.jsx routes
5. [ ] Test each admin page CRUD operations
6. [ ] Update all frontend pages to fetch from DB
7. [ ] Test public pages display correctly
8. [ ] Test enquiry forms save to DB
9. [ ] Test admin approval workflow for testimonials
10. [ ] Verify RLS policies work correctly

## 🚀 Priority Order

1. **High Priority**: Update AdminLayout and App.jsx routes (enables navigation)
2. **Medium Priority**: Create AdminTestimonials, AdminFAQs, AdminEnquiries
3. **Low Priority**: Update frontend pages to use database

You can use the existing pages with hardcoded data while building admin functionality!
