import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { ArrowRight, Shield, CheckCircle, Star, Award, Users, Calendar, MapPin, ChevronLeft, ChevronRight, Mail, Phone, MessageSquare, Activity, Heart, Target, Sparkles, Trophy, Compass, Quote } from "lucide-react"
import { CATEGORIES } from "../data/products"
import { fetchProducts } from "../services/productService"
import { getSetting } from "../services/settingsService"
import { useLanguage } from "../context/LanguageContext"
import { supabase } from "../lib/supabase"
import ProductCard from "../components/ProductCard"
import SkeletonCard from "../components/SkeletonCard"
import ScrollReveal from "../components/ScrollReveal"
import ReviewsSection from "../components/ReviewsSection"
import hero1Img from "../assets/hero1.png"
import toast from 'react-hot-toast'

const LOCAL_HERO_FALLBACK = hero1Img
const FALLBACK_CAT_IMG = "https://images.unsplash.com/photo-1614703012479-0fe5f6a89be0?w=600&q=80"
const CAT_DESC = {
  "1-14 Mukhi": "Premium riding equipment",
  "Horse Riding Mala": "Professional gear collection",
  "Bracelets": "Elegant accessories",
  "Rare Collectibles": "Exclusive collection",
}
const PX = "px-6 lg:px-12 xl:px-20"

/* --- Hero Section --- */
function HeroSlider() {
  const { t } = useLanguage()
  const [slide, setSlide] = useState(0)
  const timerRef = useRef(null)
  const TOTAL = 3
  
  useEffect(() => {
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % TOTAL), 6000)
    return () => clearInterval(timerRef.current)
  }, [])
  
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "clamp(500px, 75vh, 720px)" }}>
      {/* Background */}
      <div className="absolute inset-0 bg-[#F4E9D2]" />
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-95"
        style={{ objectPosition: 'center' }}
      >
        <source src="/herovideo.mp4" type="video/mp4" />
      </video>
      
      {/* Cinematic overlay - Enhanced for better text contrast */}
      <div className="absolute inset-0" style={{ 
        background: "linear-gradient(to top, rgba(244,233,210,0.35) 0%, rgba(244,233,210,0.25) 45%, rgba(8,43,73,0.30) 100%)" 
      }} />
      {/* Subtle gold vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 80%, rgba(197, 150, 58,0.08) 0%, transparent 60%)",
      }} />
      
      {/* Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8"
        >
          <p className="eyebrow-label mb-4" style={{
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            color: "#D2AA55"
          }}>Horse Riding Academy & Club</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-[0.06em] mb-4 text-[#082B49]" 
              style={{ 
                fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                letterSpacing: '0.04em',
                fontWeight: 500,
                lineHeight: 1.1,
                textShadow: "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)"
              }}>
            ROYAL HOOF
          </h1>
          <div className="ornamental-divider w-48 mx-auto mb-4" />
          <p className="text-sm md:text-base tracking-[0.15em] uppercase text-[#5A4430]" 
             style={{ 
               fontFamily: "'Inter', sans-serif",
               letterSpacing: '0.15em',
               fontWeight: 500,
               textShadow: "0 2px 8px rgba(0,0,0,0.3)"
             }}>
            Nallambakkam, Tamil Nadu · ESTD. 2026
          </p>
        </motion.div>

        {/* Book Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Link 
            to="/enquiry"
            className="btn-primary-equestrian inline-flex items-center gap-3 px-8 py-4 text-base"
            style={{
              boxShadow: "0 4px 16px rgba(197, 150, 58, 0.4)"
            }}
          >
            <Calendar size={20} />
            Book Now
          </Link>
        </motion.div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2.5">
        {Array(TOTAL).fill(0).map((_, i) => (
          <button 
            key={i} 
            onClick={() => { setSlide(i); clearInterval(timerRef.current) }}
            className={`rounded-full transition-all duration-500 ${
              i === slide 
                ? "w-8 h-1 bg-[#C5963A] shadow-[0_0_8px_rgba(197, 150, 58,0.4)]" 
                : "w-1.5 h-1.5 bg-[#082B49]/25 hover:bg-[#082B49]/50"
            }`} 
          />
        ))}
      </div>
    </section>
  )
}

/* --- About Section --- */
function AboutSection() {
  const [dbData, setDbData] = useState(null)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    getSetting("about_section_en").then(val => {
      if (val) { try { setDbData(JSON.parse(val)) } catch {} }
    }).catch(() => {})
    getSetting("about_image_url").then(url => {
      if (url) setImageUrl(url)
    }).catch(() => {})
  }, [])

  const d = dbData || {
    title: "Royal Hoof Horse Riding Academy",
    subtitle: "Nallambakkam, Tamil Nadu",
    p1: "Welcome to Royal Hoof Horse Riding Academy, located at GIRI FARMS in Nallambakkam, Tamil Nadu. We offer professional horse riding lessons for all ages in a safe, nurturing environment.",
    p2: "Our certified trainers are passionate about equestrian sports and dedicated to building a strong foundation for every rider � from complete beginners to experienced equestrians.",
    p3: "We offer a wide range of programmes including beginner lessons, advanced training, competitive riding, and special kids' sessions designed to build confidence and develop lifelong skills.",
    p4: "Safety is our top priority. All sessions are supervised by experienced professionals, and our horses are well-trained, healthy, and temperament-tested for rider compatibility.",
    p5: "Located conveniently within the Uniworld City, Aspen Greens community, our facility is equipped with quality arena space, stables, and training equipment.",
    p6: "Join our growing family of riders and experience the joy, freedom, and discipline that horse riding brings.",
    years: "GIRI FARMS",
    yearsLabel: "Our Home",
    authentic: "All Ages",
    authenticLabel: "Welcome",
    customers: "Mon � Sun",
    customersLabel: "6 AM � 8 PM",
  }

  const stats = [
    { value: d.years, label: d.yearsLabel, icon: <Award size={22} /> },
    { value: d.authentic, label: d.authenticLabel, icon: <CheckCircle size={22} /> },
    { value: d.customers, label: d.customersLabel, icon: <Users size={22} /> },
  ]

  const displayImage = imageUrl || "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80"

  return (
    <section className={`w-full py-20 bg-[#F4E9D2] ${PX}`}>
      <ScrollReveal>
        <div className="max-w-6xl mx-auto">
          {/* Eyebrow */}
          <p className="text-center eyebrow-label mb-3">About Us</p>
          
          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="inline-block heading-editorial font-medium tracking-[0.04em]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
              {d.title}
            </h2>
            <span className="block text-base mt-2 font-medium text-[#765334]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {d.subtitle}
            </span>
          </div>
          <div className="equestrian-divider w-24 mx-auto mb-12" />

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <div className="w-full">
              <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: "4/3" }}>
                <img
                  src={displayImage}
                  alt="About Royal Hoof"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { e.target.src = hero1Img }}
                />
              </div>

              {/* Stats below image */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {stats.map((s, i) => (
                  <div key={i} className="text-center py-5 rounded-sm equestrian-card"
                    style={{ transform: "none" }}>
                    <div className="flex justify-center mb-2" style={{ color: "#C5963A" }}>{s.icon}</div>
                    <p className="font-bold text-base text-[#082B49]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.value}</p>
                    <p className="text-xs mt-1 text-[#765334]" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Text content */}
            <div className="w-full space-y-5">
              {[d.p1, d.p2, d.p3, d.p4, d.p5, d.p6].filter(Boolean).map((para, i) => (
                <p key={i} className="leading-relaxed text-base text-[#292725]"
                  style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.8" }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Section Title --- */
function SectionTitle({ eyebrow, title }) {
  return (
    <div className="text-center mb-12">
      {eyebrow && <p className="eyebrow-label mb-3">{eyebrow}</p>}
      <h2 className="heading-editorial"
        style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}>
        {title}
      </h2>
      <div className="equestrian-divider w-24 mx-auto mt-4" />
    </div>
  )
}

/* --- Events Slider Component --- */
function EventsSlider({ events }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const intervalRef = useRef(null)

  const totalSlides = events.length

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && totalSlides > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides)
      }, 4000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isAutoPlaying, totalSlides])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000) // Resume auto-play after 5 seconds
  }

  const goToPrevious = () => {
    setCurrentSlide(prev => prev === 0 ? totalSlides - 1 : prev - 1)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const goToNext = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  if (totalSlides === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#765334] text-sm">No upcoming events at the moment</p>
        <p className="text-[#765334] text-xs mt-2">Check back soon for updates!</p>
      </div>
    )
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main Slider */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {events.map((event) => (
            <div key={event.id} className="min-w-full">
              <Link to="/events" className="group block">
                <div className="relative">
                  {/* Event Image */}
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <img 
                      src={event.image_url || 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80'} 
                      alt={event.title} 
                      loading="lazy" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Event Category Badge */}
                    <div className="absolute top-6 right-6">
                      <span className="bg-[#C5963A] text-white px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide">
                        {event.category || 'Event'}
                      </span>
                    </div>
                    
                    {/* Event Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h3 className="font-bold text-2xl md:text-3xl mb-3 text-white leading-tight"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        {event.title}
                      </h3>
                      <p className="text-base leading-relaxed mb-4 text-white/90 max-w-2xl">
                        {event.description || "Join us for this exciting event"}
                      </p>
                      <div className="flex flex-wrap items-center gap-6 text-white/80">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} />
                          <span className="text-sm font-medium">{new Date(event.event_date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            weekday: 'long'
                          })}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={18} />
                            <span className="text-sm font-medium">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? "w-8 h-2 bg-[#C5963A] rounded-full" 
                  : "w-2 h-2 bg-[#C5963A]/30 rounded-full hover:bg-[#C5963A]/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Navigation */}
      {totalSlides > 1 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {events.map((event, index) => (
            <button
              key={event.id}
              onClick={() => goToSlide(index)}
              className={`relative overflow-hidden rounded-md transition-all duration-300 ${
                index === currentSlide 
                  ? "ring-2 ring-[#C5963A] scale-105" 
                  : "hover:ring-1 hover:ring-[#C5963A]/50 hover:scale-102"
              }`}
            >
              <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                <img 
                  src={event.image_url || 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80'} 
                  alt={event.title} 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
                {index !== currentSlide && (
                  <div className="absolute inset-0 bg-black/40" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-xs font-medium truncate">
                  {event.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
function SectionHeader({ label, title, link }) {
  return (
    <div className="flex items-center justify-between mb-10">
      <div>
        <p className="eyebrow-label mb-2">{label}</p>
        <h2 className="heading-editorial text-2xl sm:text-3xl">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="flex items-center gap-2 text-sm font-medium transition-colors shrink-0 hover:gap-3 duration-300"
          style={{ color: "#C5963A", fontFamily: "'Inter', sans-serif" }}>
          View All <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}

/* --- Quick Contact Section --- */
function QuickContactSection() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error('Please fill all required fields')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('enquiries')
        .insert([
          {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            message: formData.message.trim(),
            enquiry_type: 'general',
            status: 'new'
          }
        ])

      if (error) throw error

      toast.success('Your message has been sent! We will contact you soon.')
      setFormData({ name: '', phone: '', message: '' })
      
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error('Failed to send message. Please try our contact page.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <section className={`w-full py-20 bg-[#F4E9D2] ${PX}`}>
      <ScrollReveal>
        <div className="max-w-4xl mx-auto">
          <SectionTitle eyebrow="Get In Touch" title="Quick Contact" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold text-[#292725] mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span style={{ color: "#292725" }}>Have Questions? We're Here to</span> <span style={{ color: "#D8C7A0", fontStyle: "italic" }}>Help!</span>
              </h3>
              <p className="text-[#765334] mb-8 leading-relaxed">
                Get in touch with our expert team. Whether you need product advice, have questions about our services, or want to learn more about our offerings, we're ready to assist you.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#C5963A]/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#C5963A]" />
                  </div>
                  <div>
                    <p className="text-[#292725] font-medium">Call or WhatsApp</p>
                    <p className="text-[#765334] text-sm">+91 90437 00776</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#C5963A]/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#C5963A]" />
                  </div>
                  <div>
                    <p className="text-[#292725] font-medium">Email Us</p>
                    <p className="text-[#765334] text-sm">info@royalhoof.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[rgba(8,43,73,0.15)]">
                <Link 
                  to="/contact"
                  className="inline-flex items-center gap-2 text-[#C5963A] hover:text-[#8A6640] font-medium transition-colors"
                >
                  Full Contact Page <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="equestrian-card rounded-lg p-8">
              <h4 className="text-xl font-bold text-[#292725] mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                Send Quick Message
              </h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#C5963A] text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-[#F4E9D2] border border-[rgba(8,43,73,0.15)] rounded-lg px-4 py-3 text-[#292725] placeholder-[#B9AFA3]/50 focus:outline-none focus:border-[#C5963A] transition-colors"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#C5963A] text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-[#F4E9D2] border border-[rgba(8,43,73,0.15)] rounded-lg px-4 py-3 text-[#292725] placeholder-[#B9AFA3]/50 focus:outline-none focus:border-[#C5963A] transition-colors"
                    placeholder="Your phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#C5963A] text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={4}
                    className="w-full bg-[#F4E9D2] border border-[rgba(8,43,73,0.15)] rounded-lg px-4 py-3 text-[#292725] placeholder-[#B9AFA3]/50 focus:outline-none focus:border-[#C5963A] transition-colors resize-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#C5963A] hover:bg-[#8A6640] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Enquiry CTA Section --- */
function EnquiryCTASection() {
  return (
    <section className={`w-full py-20 section-navy ${PX}`}>
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow-label mb-3">Begin Your Journey</p>
          <h3 className="heading-editorial text-3xl mb-4" style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}>
            Ready to Get Started?
          </h3>
          <div className="equestrian-divider w-24 mx-auto mb-6" />
          <p className="text-[#D8C5A0] mb-8 max-w-2xl mx-auto">
            Submit a detailed enquiry or book a free demo session to experience our services firsthand. 
            Our experts are ready to guide you through your journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/enquiry"
              className="btn-gold-equestrian inline-flex items-center gap-2"
            >
              <MessageSquare size={20} />
              Submit Enquiry
            </Link>
            
            <Link
              to="/contact"
              className="btn-secondary-equestrian inline-flex items-center gap-2"
            >
              <Phone size={20} />
              Contact Us
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Why Choose Us Section with Horse --- */
function WhyChooseUs({ displayFeatures }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let dotLottie = null

    const loadDotLottie = async () => {
      if (canvasRef.current) {
        try {
          // Use dynamic import for DotLottie
          const { DotLottie } = await import('@lottiefiles/dotlottie-web')
          
          dotLottie = new DotLottie({
            canvas: canvasRef.current,
            src: '/Horse Run.lottie',
            loop: true,
            autoplay: true,
          })
        } catch (error) {
          console.error('Failed to load DotLottie:', error)
        }
      }
    }

    loadDotLottie()

    return () => {
      if (dotLottie) {
        dotLottie.destroy()
      }
    }
  }, [])

  return (
    <section className={`w-full py-16 ${PX}`} style={{ background: "#F4E9D2", borderTop: "1px solid rgba(182, 165, 143, 0.05)", borderBottom: "1px solid rgba(182, 165, 143, 0.05)" }}>
      <SectionTitle eyebrow="Premium Service" title="Why Choose Us" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Central Horse Animation */}
        <div className="flex items-center justify-center mb-8 md:mb-0">
          <canvas 
            ref={canvasRef}
            width={280}
            height={280}
            style={{ 
              width: '280px', 
              height: '280px',
              maxWidth: '90vw',
              maxHeight: '90vw',
              filter: 'brightness(0) saturate(100%) invert(15%) sepia(30%) saturate(2000%) hue-rotate(170deg) brightness(0.35)'
            }}
          />
        </div>

        {/* Features positioned around horse */}
        <div className="grid grid-cols-2 gap-6 md:absolute md:inset-0 md:grid-cols-1 md:pointer-events-none">
          {/* Top Left */}
          <div className="flex flex-col items-center text-center gap-3 md:absolute md:top-1/4 md:left-0 lg:left-8 md:transform md:-translate-y-1/2 md:pointer-events-auto">
            <div className="w-16 h-16 rounded-full border border-[#C5963A]/30 flex items-center justify-center text-[#C5963A]"
              style={{ background: "rgba(154, 118, 80, 0.05)" }}>
              {displayFeatures[0].icon}
            </div>
            <div>
              <p className="text-[#292725] text-xs font-semibold tracking-wider uppercase mb-1" 
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayFeatures[0].title}
              </p>
              {displayFeatures[0].sub && <p className="text-[#765334] text-xs">{displayFeatures[0].sub}</p>}
            </div>
          </div>

          {/* Top Right */}
          <div className="flex flex-col items-center text-center gap-3 md:absolute md:top-1/4 md:right-0 lg:right-8 md:transform md:-translate-y-1/2 md:pointer-events-auto">
            <div className="w-16 h-16 rounded-full border border-[#C5963A]/30 flex items-center justify-center text-[#C5963A]"
              style={{ background: "rgba(154, 118, 80, 0.05)" }}>
              {displayFeatures[1].icon}
            </div>
            <div>
              <p className="text-[#292725] text-xs font-semibold tracking-wider uppercase mb-1" 
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayFeatures[1].title}
              </p>
              {displayFeatures[1].sub && <p className="text-[#765334] text-xs">{displayFeatures[1].sub}</p>}
            </div>
          </div>

          {/* Bottom Left */}
          <div className="flex flex-col items-center text-center gap-3 md:absolute md:bottom-1/4 md:left-0 lg:left-8 md:transform md:translate-y-1/2 md:pointer-events-auto">
            <div className="w-16 h-16 rounded-full border border-[#C5963A]/30 flex items-center justify-center text-[#C5963A]"
              style={{ background: "rgba(154, 118, 80, 0.05)" }}>
              {displayFeatures[2].icon}
            </div>
            <div>
              <p className="text-[#292725] text-xs font-semibold tracking-wider uppercase mb-1" 
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayFeatures[2].title}
              </p>
              {displayFeatures[2].sub && <p className="text-[#765334] text-xs">{displayFeatures[2].sub}</p>}
            </div>
          </div>

          {/* Bottom Right */}
          <div className="flex flex-col items-center text-center gap-3 md:absolute md:bottom-1/4 md:right-0 lg:right-8 md:transform md:translate-y-1/2 md:pointer-events-auto">
            <div className="w-16 h-16 rounded-full border border-[#C5963A]/30 flex items-center justify-center text-[#C5963A]"
              style={{ background: "rgba(154, 118, 80, 0.05)" }}>
              {displayFeatures[3].icon}
            </div>
            <div>
              <p className="text-[#292725] text-xs font-semibold tracking-wider uppercase mb-1" 
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayFeatures[3].title}
              </p>
              {displayFeatures[3].sub && <p className="text-[#765334] text-xs">{displayFeatures[3].sub}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --- Gallery Item Component --- */
function GalleryItemCard({ item }) {
  return (
    <Link to="/gallery" className="group block">
      <div className="relative overflow-hidden rounded-sm aspect-square">
        <img 
          src={item.media_url || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80'} 
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {item.media_type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-sm font-medium truncate">{item.title}</p>
          {item.category && (
            <p className="text-white/70 text-xs">{item.category}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

/* --- Package Item Component --- */  
function PackageCard({ pkg }) {
  return (
    <Link to="/packages" className="group block">
      <div className="equestrian-card rounded-lg p-6 h-full group-hover:scale-105 transition-transform duration-300">
        <h3 className="text-lg font-bold text-[#292725] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          {pkg.name}
        </h3>
        <div className="mb-4">
          <span className="text-2xl font-bold text-[#C5963A]">
            ₹{pkg.price?.toLocaleString('en-IN') || '0'}
          </span>
          <span className="text-[#765334] text-sm">/{pkg.duration}</span>
        </div>
        {pkg.age_group && (
          <p className="text-[#C5963A] text-sm mb-3 font-medium">{pkg.age_group}</p>
        )}
        {pkg.description && (
          <p className="text-[#765334] text-sm mb-4 leading-relaxed line-clamp-2">
            {pkg.description}
          </p>
        )}
        <div className="mt-auto">
          <div className="flex items-center gap-2 text-[#082B49] text-sm font-medium">
            View Details <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* --- Benefits Poster Section (Inspired directly by Royal Hoof Poster) --- */
function BenefitsPosterSection() {
  const leftBenefits = [
    {
      title: "PHYSICAL FITNESS",
      desc: "Improves posture, balance, strength, and coordination.",
      icon: <Activity size={22} />
    },
    {
      title: "MENTAL WELLNESS",
      desc: "Reduces stress, boosts confidence and enhances focus & discipline.",
      icon: <CheckCircle size={22} />
    },
    {
      title: "EMOTIONAL GROWTH",
      desc: "Builds empathy, patience and a deep bond with these magnificent beings.",
      icon: <Heart size={22} />
    },
    {
      title: "DISCIPLINE & FOCUS",
      desc: "Teaches responsibility, self-control, and the value of consistency.",
      icon: <Target size={22} />
    },
    {
      title: "SOCIAL CONNECTION",
      desc: "Join a community that shares your passion and creates lifelong friendships.",
      icon: <Users size={22} />
    }
  ]

  const rightBenefits = [
    {
      title: "BUILD CONFIDENCE",
      desc: "Every small achievement in the saddle builds a stronger you.",
      icon: <Shield size={22} />
    },
    {
      title: "RESILIENCE",
      desc: "Overcome challenges, build courage and never give up.",
      icon: <Award size={22} />
    },
    {
      title: "MINDFUL LIVING",
      desc: "Stay present, connect with nature and enjoy the moment.",
      icon: <Sparkles size={22} />
    },
    {
      title: "ACHIEVEMENT",
      desc: "From first ride to competitions, every milestone matters.",
      icon: <Trophy size={22} />
    },
    {
      title: "NATURE CONNECTION",
      desc: "Ride outdoors. Breathe fresh. Feel free. Reconnect with nature.",
      icon: <Compass size={22} />
    }
  ]

  const historicalQuotes = [
    {
      quote: "There is something about the outside of a horse that is good for the inside of a man.",
      author: "ALEXANDER THE GREAT"
    },
    {
      quote: "No hour of life is wasted that is spent in the saddle.",
      author: "WINSTON CHURCHILL"
    },
    {
      quote: "The best thing for the inside of a man is the outside of a horse.",
      author: "THEODORE ROOSEVELT"
    },
    {
      quote: "A good horse is worth more than riches.",
      author: "NAPOLEON BONAPARTE"
    }
  ]

  return (
    <section className={`w-full py-20 bg-[#F4E9D2] relative overflow-hidden ${PX}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="eyebrow-label mb-2 tracking-[0.3em]">BENEFITS OF</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#082B49] mb-3" style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}>
            HORSE RIDING
          </h2>
          <p className="text-lg md:text-xl italic font-serif text-[#C5963A]">
            Beyond the Ride, Stronger in Life.
          </p>
          <div className="ornamental-divider w-48 mx-auto mt-4" />
        </div>

        {/* Top Quote Callout (Pam Brown) */}
        <div className="max-w-3xl mx-auto mb-16 p-6 md:p-8 rounded-lg poster-parchment-card text-center border-l-4 border-l-[#C5963A]">
          <Quote className="w-8 h-8 mx-auto text-[#C5963A]/60 mb-3" />
          <p className="text-base md:text-lg italic text-[#292725] leading-relaxed font-serif mb-4">
            “The horse is the projection of peoples' dreams about themselves – strong, powerful, beautiful – and it has the capability of giving us escape from our mundane existence.”
          </p>
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#765334]">
            — PAM BROWN
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mb-16 items-start">
          {/* Left Column */}
          <div className="space-y-6">
            {leftBenefits.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-md hover:bg-[#F5EBD8] transition-colors border border-transparent hover:border-[#C5963A]/30">
                <div className="poster-navy-badge shrink-0 mt-1">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-bold text-[#082B49] tracking-wider uppercase mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {item.title}
                  </h4>
                  <p className="text-xs md:text-sm text-[#765334] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {rightBenefits.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-md hover:bg-[#F5EBD8] transition-colors border border-transparent hover:border-[#C5963A]/30">
                <div className="poster-navy-badge shrink-0 mt-1">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-bold text-[#082B49] tracking-wider uppercase mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {item.title}
                  </h4>
                  <p className="text-xs md:text-sm text-[#765334] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Callout Ribbon Banner */}
        <div className="my-16 py-6 px-6 md:px-12 poster-ribbon rounded-md text-center">
          <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
            <span className="hidden sm:inline-block text-[#C5963A]">✦ ────────</span>
            <h3 className="text-base sm:text-xl md:text-2xl font-semibold tracking-wider text-[#F5EBD8] uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
              HORSE RIDING ISN'T JUST A SPORT, IT'S A WAY OF LIFE.
            </h3>
            <span className="hidden sm:inline-block text-[#C5963A]">──────── ✦</span>
          </div>
        </div>

        {/* "LEGENDS HAVE SPOKEN" Quotes Strip */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <span className="inline-block bg-[#082B49] text-[#C5963A] text-xs font-bold uppercase tracking-[0.25em] px-6 py-2 rounded-full border border-[#C5963A]">
              LEGENDS HAVE SPOKEN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {historicalQuotes.map((item, i) => (
              <div key={i} className="poster-parchment-card p-6 rounded-lg flex flex-col justify-between h-full border-t-2 border-t-[#C5963A]">
                <div>
                  <span className="text-3xl text-[#C5963A] font-serif leading-none block mb-2">“</span>
                  <p className="text-xs md:text-sm italic text-[#292725] leading-relaxed mb-4">
                    {item.quote}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#C5963A]/20">
                  <p className="text-xs font-bold text-[#082B49] tracking-wider uppercase">
                    — {item.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

/* --- Main Page --- */
export default function HomePage() {
  const { t } = useLanguage()
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [dynamicCategories, setDynamicCategories] = useState(CATEGORIES)
  const [categoryImageMap, setCategoryImageMap] = useState({})
  const [features, setFeatures] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  
  // Gallery and Packages state
  const [galleryItems, setGalleryItems] = useState([])
  const [packages, setPackages] = useState([])
  const [loadingGallery, setLoadingGallery] = useState(true)
  const [loadingPackages, setLoadingPackages] = useState(true)

  useEffect(() => {
    // Load products
    fetchProducts({ sort: "newest" }).then(data => {
      setNewArrivals(data.slice(0, 6))
      setBestSellers(data.filter(p => p.tags?.includes("premium") || p.tags?.includes("certified")).slice(0, 6))
      setLoading(false)
      
      const cats = [...new Set(data.map(p => p.category).filter(Boolean))]
      if (cats.length > 0) setDynamicCategories(cats.sort())
      
      const isVid = u => u && /\.(mp4|mov|webm|ogg)(\?|$)/i.test(u)
      const imgMap = {}
      data.forEach(p => {
        if (!p.category || imgMap[p.category]) return
        const list = Array.isArray(p.images) ? p.images : [p.image || p.images].filter(Boolean)
        const thumb = list.find(m => m && !isVid(m))
        if (thumb) imgMap[p.category] = thumb
      })
      data.forEach(p => {
        if (!p.category || imgMap[p.category]) return
        const list = Array.isArray(p.images) ? p.images : [p.image || p.images].filter(Boolean)
        if (list[0]) imgMap[p.category] = list[0]
      })
      setCategoryImageMap(imgMap)
    })
    
    getSetting("features_bar").then(val => {
      if (val) { try { const p = JSON.parse(val); if (Array.isArray(p) && p.length) setFeatures(p) } catch {} }
    }).catch(() => {})

    // Load events from database
    loadEvents()
    // Load gallery items
    loadGalleryItems()
    // Load packages
    loadPackages()
  }, [])

  const loadEvents = async () => {
    setLoadingEvents(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'upcoming')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(2)

      if (error) {
        console.error('Error loading events:', error)
      } else {
        setUpcomingEvents(data || [])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const loadGalleryItems = async () => {
    setLoadingGallery(true)
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6)

      if (error) {
        console.error('Error loading gallery:', error)
      } else {
        setGalleryItems(data || [])
      }
    } catch (error) {
      console.error('Error loading gallery:', error)
    } finally {
      setLoadingGallery(false)
    }
  }

  const loadPackages = async () => {
    setLoadingPackages(true)
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6)

      if (error) {
        console.error('Error loading packages:', error)
      } else {
        setPackages(data || [])
      }
    } catch (error) {
      console.error('Error loading packages:', error)
    } finally {
      setLoadingPackages(false)
    }
  }

  const FEATURES = [
    { icon: <Shield size={24} strokeWidth={1.5} />, title: "SAFE & SECURE", sub: "Safety-first environment" },
    { icon: <CheckCircle size={24} strokeWidth={1.5} />, title: "CERTIFIED TRAINERS", sub: "Professional instructors" },
    { icon: <Star size={24} strokeWidth={1.5} />, title: "ALL AGES WELCOME", sub: "Kids & adults" },
    { icon: <Users size={24} strokeWidth={1.5} />, title: "SMALL BATCH CLASSES", sub: "Personalised attention" },
  ]

  const displayFeatures = features
    ? features.map((f, i) => ({ 
        ...FEATURES[i % FEATURES.length], 
        title: f.title?.toUpperCase() || FEATURES[i % FEATURES.length].title, 
        sub: f.desc || FEATURES[i % FEATURES.length].sub 
      }))
    : FEATURES

  return (
    <>
      <Helmet>
        <title>Equestrian Collection - Premium Riding Equipment</title>
        <meta name="description" content="Discover our curated collection of premium riding equipment and apparel." />
      </Helmet>

      {/* HERO */}
      <HeroSlider />

      {/* ABOUT - Darker */}
      <AboutSection />

      {/* EVENTS - Lighter */}
      <section id="events" className={`w-full py-20 section-navy ${PX}`}>
        <ScrollReveal>
          <SectionHeader label="Upcoming" title="Events" link="/events" />
        </ScrollReveal>
        {loadingEvents ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-[#C5963A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <EventsSlider events={upcomingEvents} />
        )}
      </section>

      {/* WHY CHOOSE - Darker */}
      <ScrollReveal>
        <WhyChooseUs displayFeatures={displayFeatures} />
      </ScrollReveal>

      {/* BENEFITS OF HORSE RIDING - Inspired by Reference Poster */}
      <ScrollReveal>
        <BenefitsPosterSection />
      </ScrollReveal>

      {/* OUR PACKAGES - Lighter */}
      <section className={`w-full py-20 ${PX}`} style={{ background: "#FAF3E4" }}>
        <ScrollReveal>
          <SectionHeader label="Premium Offers" title="Our Packages" link="/packages" />
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loadingPackages ? Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[#FAF3E4] rounded-lg h-48"></div>
            </div>
          )) : packages.length > 0 ? packages.map((pkg, i) => (
            <ScrollReveal key={pkg.id} delay={i * 0.1}>
              <PackageCard pkg={pkg} />
            </ScrollReveal>
          )) : (
            <div className="col-span-full text-center py-12">
              <p className="text-[#765334] text-lg">No packages available</p>
              <p className="text-[#765334] text-sm mt-2">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </section>

      {/* GALLERY - Darker */}
      <section className={`w-full py-20 bg-[#F4E9D2] ${PX}`}>
        <ScrollReveal>
          <SectionHeader label="Visual Showcase" title="Gallery" link="/gallery" />
        </ScrollReveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loadingGallery ? Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[#FAF3E4] rounded-sm aspect-square"></div>
            </div>
          )) : galleryItems.length > 0 ? galleryItems.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.05}>
              <GalleryItemCard item={item} />
            </ScrollReveal>
          )) : (
            <div className="col-span-full text-center py-12">
              <p className="text-[#765334] text-lg">No gallery items available</p>
              <p className="text-[#765334] text-sm mt-2">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS - Lighter */}
      <section className="w-full" style={{ background: "#FAF3E4" }}>
        <ScrollReveal><ReviewsSection /></ScrollReveal>
      </section>

      {/* QUICK CONTACT - Darker */}
      <QuickContactSection />

      {/* ENQUIRY CTA - Lighter */}
      <EnquiryCTASection />
    </>
  )
}
