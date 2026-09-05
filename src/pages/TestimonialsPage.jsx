import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Star, Quote } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_approved', true)
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setTestimonials(data || [])
      } catch (error) {
        console.error('Error fetching testimonials:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : 5.0

  return (
    <>
      <Helmet>
        <title>Testimonials - Academy</title>
        <meta name="description" content="Read what our members say about us" />
      </Helmet>

      <div className="min-h-screen py-20 px-6 lg:px-12 xl:px-20" style={{ background: '#F4E9D2' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="eyebrow-label mb-3">Reviews & Feedback</p>
            <h1 className="heading-editorial text-4xl mb-4">
              <span style={{ color: "#292725" }}>What Our Members</span> <span style={{ color: "#D8C7A0", fontStyle: "italic" }}>Say</span>
            </h1>
            <div className="equestrian-divider w-24 mx-auto mb-6" />
            <p className="text-[#C5963A] max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied members and their families
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: '500+', label: 'Happy Members' },
              { value: `${averageRating}/5`, label: 'Average Rating' },
              { value: '95%', label: 'Satisfaction Rate' },
              { value: `${testimonials.length}+`, label: 'Reviews' },
            ].map((stat, i) => (
              <div key={i} className="equestrian-card rounded-lg p-6 text-center">
                <p className="heading-editorial text-3xl mb-2 text-[#C5963A]">{stat.value}</p>
                <p className="text-[#765334] text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="equestrian-card rounded-lg p-6 animate-pulse">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(j => (
                      <div key={j} className="w-4 h-4 bg-[#FAF3E4] rounded-sm" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-[#FAF3E4] rounded" />
                    <div className="h-4 bg-[#FAF3E4] rounded w-5/6" />
                    <div className="h-4 bg-[#FAF3E4] rounded w-4/6" />
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-[rgba(8,43,73,0.15)]">
                    <div className="w-12 h-12 bg-[#FAF3E4] rounded-full" />
                    <div className="space-y-1">
                      <div className="h-4 bg-[#FAF3E4] rounded w-20" />
                      <div className="h-3 bg-[#FAF3E4] rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#C5963A] text-lg mb-4">No testimonials available yet.</p>
              <p className="text-[#765334] text-sm">Check back soon for member reviews!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="equestrian-card rounded-lg p-6 relative">
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote size={48} className="text-[#C5963A]" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#C5963A" stroke="none" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-[#C5963A] text-sm leading-relaxed mb-6">
                    "{testimonial.review}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[rgba(8,43,73,0.15)]">
                    <img 
                      src={testimonial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=9A7650&color=fff`}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=9A7650&color=fff`
                      }}
                    />
                    <div>
                      <p className="text-[#292725] font-medium">{testimonial.name}</p>
                      {testimonial.role && <p className="text-[#765334] text-xs">{testimonial.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center equestrian-card rounded-lg p-10">
            <h2 className="heading-editorial text-2xl mb-4">
              <span style={{ color: "#292725" }}>Want to Share Your</span> <span style={{ color: "#D8C7A0", fontStyle: "italic" }}>Experience?</span>
            </h2>
            <p className="text-[#C5963A] mb-6 max-w-2xl mx-auto">
              We'd love to hear from you! Share your feedback and help others make the right choice.
            </p>
            <a
              href="/enquiry"
              className="inline-block bg-[#C5963A] hover:bg-[#8A6640] text-white px-8 py-3 rounded-lg font-medium uppercase tracking-wider transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
