import { Helmet } from 'react-helmet-async'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'Member since 2022',
    rating: 5,
    text: 'Excellent training facilities and professional instructors. My daughter has improved tremendously in just 6 months. Highly recommended!',
    image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=9A7650&color=fff'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Premium Member',
    rating: 5,
    text: 'The academy provides world-class coaching and infrastructure. The staff is very supportive and the environment is perfect for learning.',
    image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=9A7650&color=fff'
  },
  {
    id: 3,
    name: 'Arun Patel',
    role: 'Parent',
    rating: 5,
    text: 'Amazing experience! My son loves attending the sessions. The coaches are patient and skilled. Great value for money.',
    image: 'https://ui-avatars.com/api/?name=Arun+Patel&background=9A7650&color=fff'
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    role: 'Member since 2021',
    rating: 5,
    text: 'Professional setup with excellent training programs. The academy has helped me achieve my goals and build confidence.',
    image: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=9A7650&color=fff'
  },
  {
    id: 5,
    name: 'Vikram Singh',
    role: 'Premium Member',
    rating: 5,
    text: 'Outstanding facilities and dedicated coaches. The personalized attention and systematic training approach makes all the difference.',
    image: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=9A7650&color=fff'
  },
  {
    id: 6,
    name: 'Meera Iyer',
    role: 'Member since 2023',
    rating: 5,
    text: 'Best academy in the city! Clean, safe environment with top-notch equipment. My kids absolutely love it here.',
    image: 'https://ui-avatars.com/api/?name=Meera+Iyer&background=9A7650&color=fff'
  },
]

export default function TestimonialsPage() {
  return (
    <>
      <Helmet>
        <title>Testimonials - Academy</title>
        <meta name="description" content="Read what our members say about us" />
      </Helmet>

      <div className="min-h-screen py-20 px-6 lg:px-12 xl:px-20" style={{ background: '#171614' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="eyebrow-label mb-3">Reviews & Feedback</p>
            <h1 className="heading-editorial text-4xl mb-4">
              <span style={{ color: "#DDD4CF" }}>What Our Members</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Say</span>
            </h1>
            <div className="equestrian-divider w-24 mx-auto mb-6" />
            <p className="text-[#D8C7AE] max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied members and their families
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: '500+', label: 'Happy Members' },
              { value: '4.9/5', label: 'Average Rating' },
              { value: '95%', label: 'Satisfaction Rate' },
              { value: '200+', label: 'Reviews' },
            ].map((stat, i) => (
              <div key={i} className="equestrian-card rounded-lg p-6 text-center">
                <p className="heading-editorial text-3xl mb-2 text-[#9A7650]">{stat.value}</p>
                <p className="text-[#B6A58F] text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map(testimonial => (
              <div key={testimonial.id} className="equestrian-card rounded-lg p-6 relative">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10">
                  <Quote size={48} className="text-[#9A7650]" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#9A7650" stroke="none" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-[#D8C7AE] text-sm leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#3A3836]">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-[#F3EBDD] font-medium">{testimonial.name}</p>
                    <p className="text-[#B6A58F] text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center equestrian-card rounded-lg p-10">
            <h2 className="heading-editorial text-2xl mb-4">
              <span style={{ color: "#DDD4CF" }}>Want to Share Your</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Experience?</span>
            </h2>
            <p className="text-[#D8C7AE] mb-6 max-w-2xl mx-auto">
              We'd love to hear from you! Share your feedback and help others make the right choice.
            </p>
            <a
              href="/enquiry"
              className="inline-block bg-[#9A7650] hover:bg-[#8A6640] text-white px-8 py-3 rounded-lg font-medium uppercase tracking-wider transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
