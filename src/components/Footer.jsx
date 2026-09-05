import { Link } from 'react-router-dom'
import { Phone, MapPin, Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer style={{
      background: "linear-gradient(180deg, #061D33 0%, #082B49 60%, #041424 100%)",
      borderTop: "2px solid #C5963A",
    }} className="mt-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(197,150,58,0.1) 0%, transparent 60%)",
      }} />

      {/* Decorative top ribbon strip */}
      <div className="bg-[#082B49] border-b border-[#C5963A]/40 py-2.5 px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#C5963A] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
          ✦ RIDE • LEARN • GROW • BELONG ✦
        </p>
      </div>

      <div className="relative w-full px-6 lg:px-12 xl:px-20 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl md:text-3xl font-bold mb-1 text-[#F5EBD8]" style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif", letterSpacing: "0.06em" }}>
              ROYAL HOOF
            </h3>
            <p className="text-xs font-semibold mb-5 tracking-[0.2em] uppercase text-[#C5963A]" style={{ fontFamily: "'Inter', sans-serif" }}>
              HORSE RIDING ACADEMY & CLUB
            </p>
            <p className="text-sm leading-relaxed mb-8 max-w-md text-[#D8C5A0]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Experience premium horse riding with professional training, boarding facilities, and trail rides. Established 2026.
            </p>

            <div className="space-y-3.5 text-sm text-[#D8C5A0]" style={{ fontFamily: "'Inter', sans-serif" }}>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#C5963A] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#F5EBD8]">GIRI FARMS, Uniworld City</p>
                  <p>Aspen Greens, Nallambakkam, Chennai, Tamil Nadu</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#C5963A]" />
                <span className="font-medium text-[#F5EBD8]">9043700776</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-[#C5963A]" />
                <span className="font-medium text-[#F5EBD8]">www.royalhoof.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="eyebrow-label mb-5 text-[#C5963A]">Our Services</h4>
            <ul className="space-y-3">
              {[
                "Horse Riding Lessons",
                "Certified Training",
                "Boarding Facilities",
                "Trail Rides & Adventures",
                "Equestrian Events",
                "Premium Care"
              ].map(service => (
                <li key={service}>
                  <span className="text-sm text-[#D8C5A0] hover:text-[#C5963A] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow-label mb-5 text-[#C5963A]">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/events", label: "Upcoming Events" },
                { to: "/packages", label: "Packages & Pricing" },
                { to: "/gallery", label: "Visual Showcase" },
                { to: "/enquiry", label: "Book a Session" },
                { to: "/contact", label: "Contact Us" },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm transition-colors duration-300 text-[#D8C5A0]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#C5963A"}
                    onMouseLeave={e => e.currentTarget.style.color = "#D8C5A0"}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="equestrian-divider my-8" />

        {/* Poster bottom contact strip layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#D8C5A0] border-t border-[#C5963A]/20 pt-6"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <div className="flex flex-wrap items-center justify-center gap-4 text-center md:text-left">
            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#C5963A]" /> NALLAMBAKKAM, CHENNAI</span>
            <span className="text-[#C5963A]">|</span>
            <span className="flex items-center gap-1.5"><Globe size={13} className="text-[#C5963A]" /> www.royalhoof.com</span>
            <span className="text-[#C5963A]">|</span>
            <span className="flex items-center gap-1.5"><Phone size={13} className="text-[#C5963A]" /> 9043700776</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#C5963A] font-semibold tracking-widest text-[0.7rem]">ESTD. 2026</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
