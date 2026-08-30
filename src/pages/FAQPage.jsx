import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, Search } from 'lucide-react'

const FAQS = [
  {
    category: 'General',
    questions: [
      {
        q: 'What are your operating hours?',
        a: 'We are open Monday to Sunday from 6:00 AM to 9:00 PM. We offer flexible timing for morning, evening, and weekend batches.'
      },
      {
        q: 'How can I contact you?',
        a: 'You can reach us via phone at +91 90437 00776, WhatsApp, or by filling out our enquiry form. We typically respond within 24 hours.'
      },
      {
        q: 'Do you offer a free trial or demo session?',
        a: 'Yes! We offer a complimentary demo session for all new members. You can book your free demo through our website or by calling us.'
      },
    ]
  },
  {
    category: 'Membership',
    questions: [
      {
        q: 'What membership packages do you offer?',
        a: 'We offer various packages including monthly, quarterly, half-yearly, and annual memberships. We also have specialized packages for kids, adults, and premium training programs.'
      },
      {
        q: 'Can I upgrade or downgrade my membership?',
        a: 'Yes, you can upgrade or modify your membership at any time. The price difference will be adjusted based on your current plan.'
      },
      {
        q: 'Is there a joining fee?',
        a: 'We have a nominal one-time registration fee that covers your member ID card, initial assessment, and kit. Current members enjoy renewal without additional registration fees.'
      },
    ]
  },
  {
    category: 'Training',
    questions: [
      {
        q: 'What age groups do you cater to?',
        a: 'We welcome everyone from age 5 and above. We have specialized programs for kids (5-12 years), teens (13-18 years), and adults (18+ years).'
      },
      {
        q: 'Do you provide personal training?',
        a: 'Yes, we offer one-on-one personal training sessions with our certified coaches. This can be booked separately or as part of our premium membership packages.'
      },
      {
        q: 'What should I bring for my first session?',
        a: 'Please bring comfortable athletic wear, indoor sports shoes, a water bottle, and a towel. All training equipment is provided by the academy.'
      },
    ]
  },
  {
    category: 'Facilities',
    questions: [
      {
        q: 'What facilities do you provide?',
        a: 'Our academy features air-conditioned training halls, modern equipment, changing rooms with lockers, drinking water, first aid facility, and ample parking space.'
      },
      {
        q: 'Is the academy safe and hygienic?',
        a: 'Absolutely. We maintain strict hygiene protocols. All equipment is sanitized regularly, and our facilities are cleaned multiple times a day.'
      },
      {
        q: 'Do you have separate batches for beginners?',
        a: 'Yes, we organize batches based on skill levels - beginner, intermediate, and advanced - to ensure everyone gets appropriate training.'
      },
    ]
  },
  {
    category: 'Payment',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept cash, UPI, debit/credit cards, and bank transfers. Online payment options are available for your convenience.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'Refunds are processed on a case-by-case basis. Please refer to our refund policy or contact us for specific situations.'
      },
      {
        q: 'Can I freeze my membership temporarily?',
        a: 'Yes, members can freeze their membership for up to 30 days in case of emergencies or medical reasons with prior intimation.'
      },
    ]
  },
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState([])

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenItems(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const filteredFAQs = searchTerm.trim() === ''
    ? FAQS
    : FAQS.map(category => ({
        ...category,
        questions: category.questions.filter(item =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)

  return (
    <>
      <Helmet>
        <title>FAQ - Frequently Asked Questions</title>
        <meta name="description" content="Find answers to common questions about our academy" />
      </Helmet>

      <div className="min-h-screen py-20 px-6 lg:px-12 xl:px-20" style={{ background: '#171614' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="eyebrow-label mb-3">Help Center</p>
            <h1 className="heading-editorial text-4xl mb-4">
              <span style={{ color: "#DDD4CF" }}>Frequently Asked</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Questions</span>
            </h1>
            <div className="equestrian-divider w-24 mx-auto mb-6" />
            <p className="text-[#D8C7AE] max-w-2xl mx-auto">
              Find answers to the most common questions about our academy, memberships, and services
            </p>
          </div>

          {/* Search */}
          <div className="mb-10">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B6A58F]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search for questions..."
                className="w-full bg-[#0D0C0B] border border-[#3A3836] rounded-lg pl-12 pr-4 py-4 text-[#F3EBDD] placeholder-[#B6A58F]/50 focus:outline-none focus:border-[#9A7650] transition-colors"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16 equestrian-card rounded-lg">
              <p className="text-[#B6A58F]">No results found for "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-[#9A7650] hover:text-[#8A6640] text-sm font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFAQs.map((category, catIndex) => (
                <div key={catIndex}>
                  {/* Category Title */}
                  <h2 className="text-[#9A7650] font-medium text-lg mb-4 uppercase tracking-wider">
                    {category.category}
                  </h2>

                  {/* Questions */}
                  <div className="space-y-3">
                    {category.questions.map((item, qIndex) => {
                      const isOpen = openItems.includes(`${catIndex}-${qIndex}`)
                      return (
                        <div key={qIndex} className="equestrian-card rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleItem(catIndex, qIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#2A2826] transition-colors"
                          >
                            <span className="text-[#F3EBDD] font-medium pr-4">{item.q}</span>
                            <ChevronDown
                              size={20}
                              className={`text-[#9A7650] flex-shrink-0 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4 pt-2 border-t border-[#3A3836]">
                              <p className="text-[#D8C7AE] leading-relaxed">{item.a}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still have questions CTA */}
          <div className="mt-16 text-center equestrian-card rounded-lg p-10">
            <h2 className="heading-editorial text-2xl mb-4">
              <span style={{ color: "#DDD4CF" }}>Still Have</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Questions?</span>
            </h2>
            <p className="text-[#D8C7AE] mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our team is here to help you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/enquiry"
                className="inline-block bg-[#9A7650] hover:bg-[#8A6640] text-white px-8 py-3 rounded-lg font-medium uppercase tracking-wider transition-colors"
              >
                Send Enquiry
              </a>
              <a
                href="tel:+919043700776"
                className="inline-block bg-[#2A2826] hover:bg-[#3A3836] text-[#F3EBDD] px-8 py-3 rounded-lg font-medium uppercase tracking-wider transition-colors"
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
