import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer style={{ background: "#0D0C0B", borderTop: "1px solid rgba(182, 165, 143, 0.1)" }} className="mt-20">
      <div className="w-full px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#D8C7AE" }}>
              ROYAL HOOF
            </h3>
            <p className="text-sm font-medium mb-4 tracking-wider uppercase" style={{ color: "#9A7650", fontFamily: "'Cormorant Garamond', serif" }}>
              Horse Riding Academy & Club
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#B6A58F", fontFamily: "'Inter', sans-serif" }}>
              Experience premium horse riding with professional training, boarding facilities, and trail rides. Established 2026.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 text-sm" style={{ color: "#B6A58F", fontFamily: "'Inter', sans-serif" }}>
              <div className="flex items-start gap-3">
                <MapPin size={15} style={{ color: "#9A7650", marginTop: "2px" }} className="flex-shrink-0" /> 
                <div>
                  <p>GIRI FARMS, Uniworld City</p>
                  <p>Aspen Greens, Nallambakkam</p>
                  <p>Tamil Nadu, India</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} style={{ color: "#9A7650" }} /> 
                9043700776
              </div>
              <div className="flex items-center gap-3">
                <Globe size={15} style={{ color: "#9A7650" }} /> 
                www.royalhoof.com
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="eyebrow-label mb-4" style={{ color: "#D8C7AE" }}>Our Services</h4>
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
                  <span className="text-sm" style={{ color: "#B6A58F", fontFamily: "'Inter', sans-serif" }}>
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="eyebrow-label mb-4" style={{ color: "#D8C7AE" }}>Quick Links</h4>
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
                    style={{ color: "#B6A58F", fontFamily: "'Inter', sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#F3EBDD"}
                    onMouseLeave={e => e.currentTarget.style.color = "#B6A58F"}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="equestrian-divider my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ color: "#B6A58F", fontFamily: "'Inter', sans-serif" }}>
          <span>© 2024 Royal Hoof Horse Riding Academy & Club. All rights reserved.</span>
          <div className="flex gap-6">
            <span>ESTD. 2026</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
