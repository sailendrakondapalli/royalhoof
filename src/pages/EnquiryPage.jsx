import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { Calendar, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'

const WHATSAPP_NUMBER = "919043700776"

export default function EnquiryPage() {
  const [activeForm, setActiveForm] = useState('enquiry') // enquiry or demo
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false)
  const [submittingDemo, setSubmittingDemo] = useState(false)
  
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: ''
  })

  const handleEnquirySubmit = async (e) => {
    e.preventDefault()
    if (!enquiryForm.name.trim()) { toast.error('Name required'); return }
    if (!enquiryForm.phone.trim()) { toast.error('Phone required'); return }
    if (!enquiryForm.message.trim()) { toast.error('Message required'); return }
    
    setSubmittingEnquiry(true)
    try {
      // Save to database
      const { error } = await supabase
        .from('enquiries')
        .insert([
          {
            name: enquiryForm.name.trim(),
            email: enquiryForm.email.trim() || null,
            phone: enquiryForm.phone.trim(),
            message: enquiryForm.message.trim(),
            enquiry_type: 'general',
            status: 'new'
          }
        ])

      if (error) throw error

      toast.success('Your enquiry has been submitted successfully! We will contact you soon.')
      
      // Also open WhatsApp for immediate contact
      const text = `*General Enquiry*\n\nName: ${enquiryForm.name}\nEmail: ${enquiryForm.email}\nPhone: ${enquiryForm.phone}\n\nMessage:\n${enquiryForm.message}`
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
      
      // Reset form
      setEnquiryForm({ name: '', email: '', phone: '', message: '' })
      
    } catch (error) {
      console.error('Error submitting enquiry:', error)
      toast.error('Failed to submit enquiry. Please try again or contact us directly via WhatsApp.')
      
      // Fallback to WhatsApp only
      const text = `*General Enquiry*\n\nName: ${enquiryForm.name}\nEmail: ${enquiryForm.email}\nPhone: ${enquiryForm.phone}\n\nMessage:\n${enquiryForm.message}`
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
    } finally {
      setSubmittingEnquiry(false)
    }
  }

  const handleDemoSubmit = async (e) => {
    e.preventDefault()
    if (!demoForm.name.trim()) { toast.error('Name required'); return }
    if (!demoForm.phone.trim()) { toast.error('Phone required'); return }
    if (!demoForm.date) { toast.error('Preferred date required'); return }
    
    setSubmittingDemo(true)
    try {
      // Save to database
      const { error } = await supabase
        .from('enquiries')
        .insert([
          {
            name: demoForm.name.trim(),
            email: demoForm.email.trim() || null,
            phone: demoForm.phone.trim(),
            message: demoForm.notes.trim() || 'Free demo session request',
            enquiry_type: 'demo',
            status: 'new',
            preferred_date: demoForm.date,
            preferred_time: demoForm.time || null
          }
        ])

      if (error) throw error

      toast.success('Your demo request has been submitted successfully! We will contact you soon.')
      
      // Also open WhatsApp for immediate contact
      const text = `*Free Demo Session Request*\n\nName: ${demoForm.name}\nEmail: ${demoForm.email}\nPhone: ${demoForm.phone}\nPreferred Date: ${demoForm.date}\nPreferred Time: ${demoForm.time || 'Flexible'}\n\nNotes:\n${demoForm.notes || 'N/A'}`
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
      
      // Reset form
      setDemoForm({ name: '', email: '', phone: '', date: '', time: '', notes: '' })
      
    } catch (error) {
      console.error('Error submitting demo request:', error)
      toast.error('Failed to submit demo request. Please try again or contact us directly via WhatsApp.')
      
      // Fallback to WhatsApp only
      const text = `*Free Demo Session Request*\n\nName: ${demoForm.name}\nEmail: ${demoForm.email}\nPhone: ${demoForm.phone}\nPreferred Date: ${demoForm.date}\nPreferred Time: ${demoForm.time || 'Flexible'}\n\nNotes:\n${demoForm.notes || 'N/A'}`
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
    } finally {
      setSubmittingDemo(false)
    }
  }

  const inputClass = 'input-premium w-full rounded-sm px-4 py-3 text-[#292725] placeholder-[#B9AFA3]/50'
  const labelClass = 'block text-[#C5963A] text-sm font-medium mb-2'

  return (
    <>
      <Helmet>
        <title>Enquiry & Free Demo - Academy</title>
        <meta name="description" content="Contact us or book a free demo session" />
      </Helmet>

      <div className="min-h-screen py-20 px-6 lg:px-12 xl:px-20" style={{ background: '#F4E9D2' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="eyebrow-label mb-3">Get In Touch</p>
            <h1 className="heading-editorial text-4xl mb-4">
              <span style={{ color: "#292725" }}>Enquiry &</span> <span style={{ color: "#D8C7A0", fontStyle: "italic" }}>Free Demo</span>
            </h1>
            <div className="equestrian-divider w-24 mx-auto mb-6" />
            <p className="text-[#C5963A] max-w-2xl mx-auto">
              Have questions or want to experience our academy? Send us an enquiry or book a free demo session.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-10">
            <button
              onClick={() => setActiveForm('enquiry')}
              className={`px-8 py-3 rounded-sm text-sm font-medium uppercase tracking-wider transition-all border ${
                activeForm === 'enquiry'
                  ? 'bg-[#C5963A] text-[#082B49] border-[#C5963A]'
                  : 'bg-transparent text-[#765334] border-[rgba(197, 150, 58,0.25)] hover:border-[rgba(197, 150, 58,0.45)] hover:text-[#D8C7A0]'
              }`}
            >
              <MessageSquare size={18} className="inline-block mr-2 mb-1" />
              General Enquiry
            </button>
            <button
              onClick={() => setActiveForm('demo')}
              className={`px-8 py-3 rounded-sm text-sm font-medium uppercase tracking-wider transition-all border ${
                activeForm === 'demo'
                  ? 'bg-[#C5963A] text-[#082B49] border-[#C5963A]'
                  : 'bg-transparent text-[#765334] border-[rgba(197, 150, 58,0.25)] hover:border-[rgba(197, 150, 58,0.45)] hover:text-[#D8C7A0]'
              }`}
            >
              <Calendar size={18} className="inline-block mr-2 mb-1" />
              Book Free Demo
            </button>
          </div>

          {/* Forms */}
          <div className="equestrian-card rounded-lg p-8">
            {activeForm === 'enquiry' ? (
              <form onSubmit={handleEnquirySubmit} className="space-y-6">
                <div>
                  <label className={labelClass}>
                    <User size={16} className="inline-block mr-2 mb-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={enquiryForm.name}
                    onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      <Mail size={16} className="inline-block mr-2 mb-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={enquiryForm.email}
                      onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Phone size={16} className="inline-block mr-2 mb-1" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={enquiryForm.phone}
                      onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    <MessageSquare size={16} className="inline-block mr-2 mb-1" />
                    Your Message *
                  </label>
                  <textarea
                    value={enquiryForm.message}
                    onChange={e => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Tell us what you'd like to know..."
                    rows={6}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingEnquiry}
                  className="btn-primary-equestrian w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingEnquiry ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Enquiry...
                    </span>
                  ) : (
                    'Send Enquiry'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-6">
                <div>
                  <label className={labelClass}>
                    <User size={16} className="inline-block mr-2 mb-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={demoForm.name}
                    onChange={e => setDemoForm({ ...demoForm, name: e.target.value })}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      <Mail size={16} className="inline-block mr-2 mb-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={demoForm.email}
                      onChange={e => setDemoForm({ ...demoForm, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Phone size={16} className="inline-block mr-2 mb-1" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={demoForm.phone}
                      onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      <Calendar size={16} className="inline-block mr-2 mb-1" />
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={demoForm.date}
                      onChange={e => setDemoForm({ ...demoForm, date: e.target.value })}
                      className={inputClass}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={demoForm.time}
                      onChange={e => setDemoForm({ ...demoForm, time: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Additional Notes</label>
                  <textarea
                    value={demoForm.notes}
                    onChange={e => setDemoForm({ ...demoForm, notes: e.target.value })}
                    placeholder="Any specific requirements or questions..."
                    rows={4}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingDemo}
                  className="btn-primary-equestrian w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingDemo ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Booking Demo...
                    </span>
                  ) : (
                    'Book Free Demo Session'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-10 text-center text-[#765334]">
            <p className="text-sm">You can also reach us directly:</p>
            <p className="text-lg font-medium text-[#C5963A] mt-2">
              <Phone size={18} className="inline-block mr-2 mb-1" />
              +91 90437 00776
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
