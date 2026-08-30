import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const policies = {
  'shipping-policy': {
    title: 'Booking & Scheduling Policy',
    sections: [
      {
        heading: 'Session Booking',
        text: 'All riding sessions must be booked at least 24 hours in advance. Walk-in bookings are subject to horse and trainer availability.\n\nPlease contact us via WhatsApp or phone to confirm your slot.'
      },
      {
        heading: 'Session Timings',
        text: 'Sessions run Monday to Sunday, 6:00 AM – 8:00 PM IST.\n\nMorning slots (6 AM – 9 AM) and evening slots (5 PM – 8 PM) are most popular — book early to secure your preferred time.'
      },
      {
        heading: 'Cancellation by You',
        text: 'If you need to cancel, please notify us at least 12 hours before your session.\n\nCancellations made less than 12 hours before the session may not be eligible for a rescheduling.'
      },
      {
        heading: 'Cancellation by Us',
        text: 'In cases of extreme weather, horse health issues, or other unforeseen circumstances, we may need to reschedule your session.\n\nWe will notify you as early as possible and offer an alternative slot.'
      },
      {
        heading: 'Contact',
        text: '📞 Phone / WhatsApp: +91 90437 00776\n📧 info@royalhoof.com\n📍 GIRI FARMS, Uniworld City, Aspen Greens, Nallambakkam, Tamil Nadu'
      },
    ]
  },
  'refund-policy': {
    title: 'Refund Policy',
    sections: [
      {
        heading: 'Package Refunds',
        text: 'If you have purchased a riding package and wish to cancel before your first session, a full refund will be issued within 5–7 working days.\n\nOnce sessions have commenced, refunds are available on a pro-rated basis for unused sessions only.'
      },
      {
        heading: 'Single Session Refunds',
        text: 'Single session fees are non-refundable after the session has taken place.\n\nIf a session is cancelled by Royal Hoof, a full refund or complimentary rescheduling will be offered.'
      },
      {
        heading: 'How to Request a Refund',
        text: 'Contact us via WhatsApp or email with your name, booking details, and reason for the refund request.\n\n📱 WhatsApp: +91 90437 00776\n📧 info@royalhoof.com\n\nRefunds are processed within 5–7 working days after approval.'
      },
      {
        heading: 'Non-Refundable Items',
        text: 'Riding equipment rental fees, coaching consultation fees, and event registration fees are non-refundable once the service has been rendered.'
      },
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    sections: [
      { heading: 'Information We Collect', text: 'We collect your name, email address, phone number, and booking details when you make an enquiry or book a session.' },
      { heading: 'How We Use It', text: 'Your information is used solely to confirm bookings, send reminders, and communicate updates. We do not sell or share your data with third parties.' },
      { heading: 'Data Security', text: 'All data is stored securely. Payment transactions are handled via trusted third-party processors and we do not store card details.' },
      { heading: 'Cookies', text: 'We use cookies to improve site performance and remember your preferences. You can disable cookies in your browser settings.' },
      { heading: 'Contact', text: 'For any privacy concerns:\n📧 info@royalhoof.com\n📞 +91 90437 00776' },
    ]
  }
}

export default function PolicyPage() {
  const { pathname } = useLocation()
  const slug = pathname.replace('/', '')
  const policy = policies[slug]

  if (!policy) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1A1714" }}>
        <p style={{ color: "rgba(243,235,221,0.4)", fontFamily: "'Inter', sans-serif" }}>Page not found.</p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{policy.title} – Royal Hoof Horse Riding Academy</title>
      </Helmet>

      <div style={{ background: "#1A1714", minHeight: "100vh", padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Page header */}
          <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#D8C7AE", marginBottom: 10 }}>
              Royal Hoof Horse Riding Academy
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, color: "#F3EBDD", lineHeight: 1.15 }}>
              {policy.title}
            </h1>
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {policy.sections.map((section, i) => (
              <div key={i} style={{
                background: "#242120",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "20px 24px",
              }}>
                <h2 style={{ color: "#D8C7AE", fontWeight: 600, fontSize: "1rem", marginBottom: 10, fontFamily: "'Inter', sans-serif" }}>
                  {section.heading}
                </h2>
                <p style={{ color: "rgba(243,235,221,0.7)", fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-line", fontFamily: "'Inter', sans-serif" }}>
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          <p style={{ color: "rgba(243,235,221,0.25)", fontSize: "0.75rem", textAlign: "center", marginTop: 40, fontFamily: "'Inter', sans-serif" }}>
            Last updated: August 2026 · Royal Hoof Horse Riding Academy
          </p>
        </div>
      </div>
    </>
  )
}
