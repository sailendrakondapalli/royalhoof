import { Link } from 'react-router-dom'
import { Phone, MapPin, Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer style={{
      background: "linear-gradient(180deg, #16080B 0%, #0E0507 100%)",
      borderTop: "1px solid rgba(201, 162, 39, 0.25)",
    }} className="mt-20 relative overflow-hidden">
      {/* Subtle gold radial accent */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.04) 0%, transparent 55%)",
      }} />

      <div className="relative w-full px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-medium mb-1 text-gold-gradient" style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif", letterSpacing: "0.06em" }}>
              ROYAL HOOF
            </h3>
            <p className="text-xs font-medium mb-5 tracking-[0.2em] uppercase" style={{ color: "#D8C7A0", fontFamily: "'Inter', sans-serif" }}>
              Horse Riding Academy & Club
            </p>
            <p className="text-sm leading-relaxed mb-8 max-w-md" style={{ color: "#B9AFA3", fontFamily: "'Inter', sans-serif" }}>
              Experience premium horse riding with professional training, boarding facilities, and trail rides. Established 2026.
            </p>

            {/* Contact Information */}
            <div className="space-y-3.5 text-sm" style={{ color: "#B9AFA3", fontFamily: "'Inter', sans-serif" }}>
              <div className="flex items-start gap-3">
                <MapPin size={15} style={{ color: "#C9A227", marginTop: "2px" }} className="flex-shrink-0" />
                <div>
                  <p>GIRI FARMS, Uniworld City</p>
                  <p>Aspen Greens, Nallambakkam</p>
                  <p>Tamil Nadu, India</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} style={{ color: "#C9A227" }} />
                9043700776
              </div>
              <div className="flex items-center gap-3">
                <Globe size={15} style={{ color: "#C9A227" }} />
                www.royalhoof.com
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="eyebrow-label mb-5">Our Services</h4>
            <ul className="space-y-3">
              {[
                "Horse Riding",
                "Training Programs",
                "Boarding Facilities",
                "Trail Rides",
                "Photoshoots",
                "Premium Care"
              ].map(service => (
                <li key={service}>
                  <span className="text-sm" style={{ color: "#B9AFA3", fontFamily: "'Inter', sans-serif" }}>
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="eyebrow-label mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/events", label: "Events" },
                { to: "/packages", label: "Packages" },
                { to: "/gallery", label: "Gallery" },
                { to: "/enquiry", label: "Book Now" },
                { to: "/contact", label: "Contact" },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm transition-colors duration-300"
                    style={{ color: "#B9AFA3", fontFamily: "'Inter', sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#E0C15A"}
                    onMouseLeave={e => e.currentTarget.style.color = "#B9AFA3"}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="equestrian-divider my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ color: "#B9AFA3", fontFamily: "'Inter', sans-serif" }}>
          <span>© 2024 Royal Hoof Horse Riding Academy & Club. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span className="w-8 h-px inline-block" style={{ background: "rgba(201,162,39,0.4)" }} />
            <span style={{ color: "#C9A227", letterSpacing: "0.15em" }}>ESTD. 2026</span>
            <span className="w-8 h-px inline-block" style={{ background: "rgba(201,162,39,0.4)" }} />
          </div>
        </div>
      </div>
    </footer>
  )
}
