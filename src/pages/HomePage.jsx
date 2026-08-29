import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { ArrowRight, Shield, Truck, Headphones, CheckCircle, Star, Award, Users, Calendar, MapPin, ChevronLeft, ChevronRight, Mail, Phone, MessageSquare } from "lucide-react"
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
  "Rudraksha Mala": "Professional gear collection",
  "Bracelets": "Elegant accessories",
  "Rare Collectibles": "Exclusive collection",
}
const PX = "px-6 lg:px-12 xl:px-20"

/* ─── Hero Section ─── */
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
      {/* Background Video */}
      <div className="absolute inset-0 bg-[#171614]" />
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center' }}
      >
        <source src="/herovideo.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay - subtle dark gradient */}
      <div className="absolute inset-0" style={{ 
        background: "linear-gradient(to top, rgba(23, 22, 20, 0.85) 0%, rgba(23, 22, 20, 0.4) 50%, rgba(23, 22, 20, 0.2) 100%)" 
      }} />
      
      {/* Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-6 sm:px-12">
        {/* Website Name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight" 
              style={{ 
                fontFamily: "'Cormorant Garamond', serif",
                textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
              }}>
            ROYALHOOF
          </h1>
          <p className="text-xl md:text-2xl text-white/90 tracking-wider uppercase font-light" 
             style={{ 
               fontFamily: "'Cormorant Garamond', serif",
               textShadow: '1px 1px 4px rgba(0,0,0,0.6)'
             }}>
            Horse Riding Academy
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
            className="inline-flex items-center gap-3 px-8 py-4 rounded-sm font-bold text-lg tracking-wide uppercase transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ 
              background: "linear-gradient(135deg, #D8C7AE 0%, #B6A58F 100%)",
              color: "#171614",
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 20px rgba(216, 199, 174, 0.4)'
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
                ? "w-8 h-1.5 bg-[#D8C7AE]" 
                : "w-1.5 h-1.5 bg-[#F3EBDD]/30"
            }`} 
          />
        ))}
      </div>
    </section>
  )
}

/* ─── About Section ─── */
function AboutSection() {
  const { t, lang } = useLanguage()
  const [dbData, setDbData] = useState(null)

  useEffect(() => {
    const key = lang === "te" ? "about_section_te" : "about_section_en"
    getSetting(key).then(val => {
      if (val) { try { setDbData(JSON.parse(val)) } catch {} }
    }).catch(() => {})
  }, [lang])

  const d = dbData || {
    title: "Our Heritage", 
    subtitle: "Craftsmanship & Tradition",
    p1: "Founded on principles of excellence and authenticity, our collection represents generations of equestrian craftsmanship.",
    p2: "Each piece in our collection is carefully selected for its quality, durability, and timeless aesthetic.",
    p3: "We partner with master artisans and established manufacturers to bring you equipment that performs as beautifully as it looks.",
    p4: "From competition rings to countryside trails, our gear accompanies riders on every journey.",
    p5: "We believe that proper equipment is not a luxury but an essential foundation for the partnership between horse and rider.",
    p6: "Join our community of riders who demand excellence and appreciate the finer details.",
    years: "25+",
    yearsLabel: "Years Heritage",
    authentic: "100%",
    authenticLabel: "Authentic Quality",
    customers: "10K+",
    customersLabel: "Satisfied Riders",
  }

  const stats = [
    { value: d.years, label: d.yearsLabel, icon: <Award size={22} /> },
    { value: d.authentic, label: d.authenticLabel, icon: <CheckCircle size={22} /> },
    { value: d.customers, label: d.customersLabel, icon: <Users size={22} /> },
  ]

  return (
    <section className={`w-full py-20 bg-[#171614] ${PX}`}>
      <ScrollReveal>
        <div className="max-w-6xl mx-auto">
          {/* Eyebrow */}
          <p className="text-center eyebrow-label mb-3">About Our Collection</p>
          
          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="heading-editorial inline-block"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
              Our <span style={{ color: "#8B4938", fontStyle: "italic" }}>Heritage</span>
            </h2>
            <span className="block text-base mt-2 font-medium" style={{ color: "#B6A58F", fontFamily: "'Inter', sans-serif" }}>
              {d.subtitle}
            </span>
          </div>
          <div className="equestrian-divider w-24 mx-auto mb-12" />

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-start">
            {/* Heritage Image - Shows on both mobile and desktop */}
            <div className="w-full">
              <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: "4/3" }}>
                <img 
                  src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80" 
                  alt="Heritage Horse"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { e.target.src = hero1Img }}
                />
              </div>
            </div>

            {/* Text content and Stats Column */}
            <div className="w-full space-y-8">
              {/* Text content */}
              <div className="space-y-5">
                {[d.p1, d.p2, d.p3, d.p4, d.p5, d.p6].map((para, i) => (
                  <p key={i} className="leading-relaxed text-base"
                    style={{ color: "#D8C7AE", fontFamily: "'Inter', sans-serif", lineHeight: "1.8" }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* ─── Section Title ─── */
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

/* ─── Events Slider Component ─── */
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
        <p className="text-[#B6A58F] text-sm">No upcoming events at the moment</p>
        <p className="text-[#B6A58F] text-xs mt-2">Check back soon for updates!</p>
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
                      <span className="bg-[#9A7650] text-white px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide">
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
                  ? "w-8 h-2 bg-[#9A7650] rounded-full" 
                  : "w-2 h-2 bg-[#9A7650]/30 rounded-full hover:bg-[#9A7650]/50"
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
                  ? "ring-2 ring-[#9A7650] scale-105" 
                  : "hover:ring-1 hover:ring-[#9A7650]/50 hover:scale-102"
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
          style={{ color: "#9A7650", fontFamily: "'Inter', sans-serif" }}>
          View All <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}

/* ─── Quick Contact Section ─── */
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
    <section className={`w-full py-20 bg-[#171614] ${PX}`}>
      <ScrollReveal>
        <div className="max-w-4xl mx-auto">
          <SectionTitle eyebrow="Get In Touch" title="Quick Contact" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold text-[#F3EBDD] mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span style={{ color: "#DDD4CF" }}>Have Questions? We're Here to</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Help!</span>
              </h3>
              <p className="text-[#D8C7AE] mb-8 leading-relaxed">
                Get in touch with our expert team. Whether you need product advice, have questions about our services, or want to learn more about our offerings, we're ready to assist you.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#9A7650]/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#9A7650]" />
                  </div>
                  <div>
                    <p className="text-[#F3EBDD] font-medium">Call or WhatsApp</p>
                    <p className="text-[#B6A58F] text-sm">+91 99944 41363</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#9A7650]/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#9A7650]" />
                  </div>
                  <div>
                    <p className="text-[#F3EBDD] font-medium">Email Us</p>
                    <p className="text-[#B6A58F] text-sm">sivasri3545@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#3A3836]">
                <Link 
                  to="/contact"
                  className="inline-flex items-center gap-2 text-[#9A7650] hover:text-[#8A6640] font-medium transition-colors"
                >
                  Full Contact Page <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="equestrian-card rounded-lg p-8">
              <h4 className="text-xl font-bold text-[#F3EBDD] mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                Send Quick Message
              </h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#D8C7AE] text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-[#0D0C0B] border border-[#3A3836] rounded-lg px-4 py-3 text-[#F3EBDD] placeholder-[#B6A58F]/50 focus:outline-none focus:border-[#9A7650] transition-colors"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#D8C7AE] text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-[#0D0C0B] border border-[#3A3836] rounded-lg px-4 py-3 text-[#F3EBDD] placeholder-[#B6A58F]/50 focus:outline-none focus:border-[#9A7650] transition-colors"
                    placeholder="Your phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#D8C7AE] text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={4}
                    className="w-full bg-[#0D0C0B] border border-[#3A3836] rounded-lg px-4 py-3 text-[#F3EBDD] placeholder-[#B6A58F]/50 focus:outline-none focus:border-[#9A7650] transition-colors resize-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#9A7650] hover:bg-[#8A6640] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

/* ─── Enquiry CTA Section ─── */
function EnquiryCTASection() {
  return (
    <section className={`w-full py-16 bg-[#0D0C0B] ${PX}`}>
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-[#F3EBDD] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span style={{ color: "#DDD4CF" }}>Ready to Get</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Started?</span>
          </h3>
          <p className="text-[#D8C7AE] mb-8 max-w-2xl mx-auto">
            Submit a detailed enquiry or book a free demo session to experience our services firsthand. 
            Our experts are ready to guide you through your journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/enquiry"
              className="bg-[#9A7650] hover:bg-[#8A6640] text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <MessageSquare size={20} />
              Submit Enquiry
            </Link>
            
            <Link
              to="/contact"
              className="bg-transparent border-2 border-[#9A7650] text-[#9A7650] hover:bg-[#9A7650] hover:text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center gap-2"
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

/* ─── Why Choose Us Section with Horse ─── */
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
    <section className={`w-full py-16 ${PX}`} style={{ background: "#171614", borderTop: "1px solid rgba(182, 165, 143, 0.05)", borderBottom: "1px solid rgba(182, 165, 143, 0.05)" }}>
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
              filter: 'brightness(0) invert(1)' // Makes it white
            }}
          />
        </div>

        {/* Features positioned around horse */}
        <div className="grid grid-cols-2 gap-6 md:absolute md:inset-0 md:grid-cols-1 md:pointer-events-none">
          {/* Top Left */}
          <div className="flex flex-col items-center text-center gap-3 md:absolute md:top-1/4 md:left-0 lg:left-8 md:transform md:-translate-y-1/2 md:pointer-events-auto">
            <div className="w-16 h-16 rounded-full border border-[#9A7650]/30 flex items-center justify-center text-[#9A7650]"
              style={{ background: "rgba(154, 118, 80, 0.05)" }}>
              {displayFeatures[0].icon}
            </div>
            <div>
              <p className="text-[#F3EBDD] text-xs font-semibold tracking-wider uppercase mb-1" 
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayFeatures[0].title}
              </p>
              {displayFeatures[0].sub && <p className="text-[#B6A58F] text-xs">{displayFeatures[0].sub}</p>}
            </div>
          </div>

          {/* Top Right */}
          <div className="flex flex-col items-center text-center gap-3 md:absolute md:top-1/4 md:right-0 lg:right-8 md:transform md:-translate-y-1/2 md:pointer-events-auto">
            <div className="w-16 h-16 rounded-full border border-[#9A7650]/30 flex items-center justify-center text-[#9A7650]"
              style={{ background: "rgba(154, 118, 80, 0.05)" }}>
              {displayFeatures[1].icon}
            </div>
            <div>
              <p className="text-[#F3EBDD] text-xs font-semibold tracking-wider uppercase mb-1" 
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayFeatures[1].title}
              </p>
              {displayFeatures[1].sub && <p className="text-[#B6A58F] text-xs">{displayFeatures[1].sub}</p>}
            </div>
          </div>

          {/* Bottom Left */}
          <div className="flex flex-col items-center text-center gap-3 md:absolute md:bottom-1/4 md:left-0 lg:left-8 md:transform md:translate-y-1/2 md:pointer-events-auto">
            <div className="w-16 h-16 rounded-full border border-[#9A7650]/30 flex items-center justify-center text-[#9A7650]"
              style={{ background: "rgba(154, 118, 80, 0.05)" }}>
              {displayFeatures[2].icon}
            </div>
            <div>
              <p className="text-[#F3EBDD] text-xs font-semibold tracking-wider uppercase mb-1" 
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayFeatures[2].title}
              </p>
              {displayFeatures[2].sub && <p className="text-[#B6A58F] text-xs">{displayFeatures[2].sub}</p>}
            </div>
          </div>

          {/* Bottom Right */}
          <div className="flex flex-col items-center text-center gap-3 md:absolute md:bottom-1/4 md:right-0 lg:right-8 md:transform md:translate-y-1/2 md:pointer-events-auto">
            <div className="w-16 h-16 rounded-full border border-[#9A7650]/30 flex items-center justify-center text-[#9A7650]"
              style={{ background: "rgba(154, 118, 80, 0.05)" }}>
              {displayFeatures[3].icon}
            </div>
            <div>
              <p className="text-[#F3EBDD] text-xs font-semibold tracking-wider uppercase mb-1" 
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayFeatures[3].title}
              </p>
              {displayFeatures[3].sub && <p className="text-[#B6A58F] text-xs">{displayFeatures[3].sub}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Gallery Item Component ─── */
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

/* ─── Package Item Component ─── */  
function PackageCard({ pkg }) {
  return (
    <Link to="/packages" className="group block">
      <div className="equestrian-card rounded-lg p-6 h-full group-hover:scale-105 transition-transform duration-300">
        <h3 className="text-lg font-bold text-[#F3EBDD] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          {pkg.name}
        </h3>
        <div className="mb-4">
          <span className="text-2xl font-bold text-[#9A7650]">
            ₹{pkg.price?.toLocaleString('en-IN') || '0'}
          </span>
          <span className="text-[#B6A58F] text-sm">/{pkg.duration}</span>
        </div>
        {pkg.age_group && (
          <p className="text-[#9A7650] text-sm mb-3 font-medium">{pkg.age_group}</p>
        )}
        {pkg.description && (
          <p className="text-[#D8C7AE] text-sm mb-4 leading-relaxed line-clamp-2">
            {pkg.description}
          </p>
        )}
        <div className="mt-auto">
          <div className="flex items-center gap-2 text-[#9A7650] text-sm font-medium">
            View Details <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─── Main Page ─── */
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
    { icon: <CheckCircle size={24} strokeWidth={1.5} />, title: "CERTIFIED QUALITY", sub: "Authentic equipment" },
    { icon: <Shield size={24} strokeWidth={1.5} />, title: "GUARANTEED", sub: "Premium materials" },
    { icon: <Headphones size={24} strokeWidth={1.5} />, title: "EXPERT SUPPORT", sub: "Dedicated assistance" },
    { icon: <Truck size={24} strokeWidth={1.5} />, title: "WORLDWIDE DELIVERY", sub: "Fast shipping" },
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

      {/* ABOUT */}
      <AboutSection />

      {/* EVENTS */}
      <section id="events" className={`w-full py-20 bg-[#0D0C0B] ${PX}`}>
        <ScrollReveal>
          <SectionHeader label="Upcoming" title="Events" link="/events" />
        </ScrollReveal>
        {loadingEvents ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-[#9A7650] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <EventsSlider events={upcomingEvents} />
        )}
      </section>

      {/* WHY CHOOSE */}
      <ScrollReveal>
        <WhyChooseUs displayFeatures={displayFeatures} />
      </ScrollReveal>

      {/* OUR PACKAGES */}
      <section className={`w-full py-20 bg-gradient-to-br from-[#2A251F] to-[#1F1C17] ${PX}`}>
        <ScrollReveal>
          <SectionHeader label="Premium Offers" title="Our Packages" link="/packages" />
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loadingPackages ? Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[#2A2826] rounded-lg h-48"></div>
            </div>
          )) : packages.length > 0 ? packages.map((pkg, i) => (
            <ScrollReveal key={pkg.id} delay={i * 0.1}>
              <PackageCard pkg={pkg} />
            </ScrollReveal>
          )) : (
            <div className="col-span-full text-center py-12">
              <p className="text-[#B6A58F] text-lg">No packages available</p>
              <p className="text-[#B6A58F] text-sm mt-2">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </section>

      {/* GALLERY */}
      <section className={`w-full py-20 bg-[#0D0C0B] ${PX}`}>
        <ScrollReveal>
          <SectionHeader label="Visual Showcase" title="Gallery" link="/gallery" />
        </ScrollReveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loadingGallery ? Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[#2A2826] rounded-sm aspect-square"></div>
            </div>
          )) : galleryItems.length > 0 ? galleryItems.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.05}>
              <GalleryItemCard item={item} />
            </ScrollReveal>
          )) : (
            <div className="col-span-full text-center py-12">
              <p className="text-[#B6A58F] text-lg">No gallery items available</p>
              <p className="text-[#B6A58F] text-sm mt-2">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="w-full bg-[#171614]">
        <ScrollReveal><ReviewsSection /></ScrollReveal>
      </section>

      {/* QUICK CONTACT */}
      <QuickContactSection />

      {/* ENQUIRY CTA */}
      <EnquiryCTASection />

      {/* QUICK CONTACT */}
      <QuickContactSection />

      {/* ENQUIRY CTA */}
      <EnquiryCTASection />
    </>
  )
}
