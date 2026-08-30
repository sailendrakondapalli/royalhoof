import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { createPortal } from "react-dom"
import { Search, Settings, Store } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useAdminStore } from "../store/adminStore"
import { getSetting } from "../services/settingsService"
import { isAdmin as checkIsAdmin } from "./AdminRoute"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuthStore()
  const { products, loadProducts } = useAdminStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const userRef = useRef(null)
  const searchRef = useRef(null)
  const canvasRef = useRef(null)
  const isAdmin = checkIsAdmin(user)
  const isOnAdminPanel = pathname.startsWith("/admin")

  // Load Horse Animation for logo
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

  useEffect(() => {
    getSetting("site_logo_url").catch(() => {})
  }, [])

  useEffect(() => {
    if (!products.length) loadProducts()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        // Handle user menu if needed
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions([])
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler) }
  }, [])

  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.trim().length >= 2 && products.length) {
      const lower = q.toLowerCase()
      const matches = products.filter(p =>
        p.name?.toLowerCase().includes(lower) ||
        p.category?.toLowerCase().includes(lower) ||
        (p.custom_id || "").toLowerCase().includes(lower)
      ).slice(0, 6)
      setSuggestions(matches)
    } else {
      setSuggestions([])
    }
  }

  const handleSearch = (e) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery(""); setSuggestions([])
      setMenuOpen(false)
    }
  }

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.id}`)
    setSearchQuery(""); setSuggestions([])
  }

  const closeAll = () => { 
    setMenuOpen(false)
  }

  const navStyle = {
    background: scrolled ? "#2C2C2C" : (pathname === "/" ? "rgba(44, 44, 44, 0.9)" : "#2C2C2C"),
    backdropFilter: scrolled || pathname === "/" ? "blur(20px)" : "none",
    boxShadow: scrolled ? "0 1px 0 rgba(255, 255, 255, 0.1)" : "none",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  }

  const iconStyle = "w-10 h-10 flex items-center justify-center text-[#F3EBDD] hover:text-[#D8C7AE] transition-colors duration-300"

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    { to: "/packages", label: "Packages" },
    { to: "/gallery", label: "Gallery" },
    { to: "/testimonials", label: "Testimonials" },
    { to: "/faq", label: "FAQ" },
    { to: "/enquiry", label: "Enquiry" },
    { to: "/contact", label: "Contact" },
  ]

  // Mobile sidebar rendered via portal so it escapes ALL stacking contexts
  const mobileSidebar = menuOpen ? createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 99999 }}>
      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)" }}
      />
      {/* Sidebar panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "280px",
          background: "#2C2C2C",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          zIndex: 100000,
        }}
      >
        {/* Sidebar header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#DDD4CF",
            letterSpacing: "0.05em",
          }}>
            ROYALHOOF
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ color: "#DDD4CF", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {navLinks.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "13px 24px",
                color: "#DDD4CF",
                textDecoration: "none",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.0625rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(216,199,174,0.12)"
                e.currentTarget.style.color = "#D8C7AE"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = "#DDD4CF"
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin button inside sidebar */}
          {isAdmin && (
            <div style={{ padding: "20px 24px 0" }}>
              <Link
                to={isOnAdminPanel ? "/" : "/admin"}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  background: "#D8C7AE",
                  color: "#171614",
                  padding: "10px 16px",
                  borderRadius: "4px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textAlign: "center",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {isOnAdminPanel ? "User Panel" : "Admin Panel"}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      <nav className="sticky top-0 w-full" style={{ ...navStyle, zIndex: 50 }}>
        {/* MAIN ROW */}
        <div className="w-full px-6 lg:px-12 xl:px-20 h-20 flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0" onClick={closeAll}>
            <div className="h-11 w-11 rounded-sm border border-[#CDBC91]/20 flex-shrink-0 flex items-center justify-center bg-transparent overflow-hidden">
              <canvas
                ref={canvasRef}
                width={44}
                height={44}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  filter: 'brightness(0) invert(1)'
                }}
              />
            </div>
            <div className="block leading-tight">
              <div className="font-medium tracking-tight text-[1.125rem] text-[#DDD4CF] sm:hidden" 
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                ROYALHOOF
              </div>
              <div className="hidden sm:block">
                <div className="font-medium tracking-tight text-[1.125rem] text-[#DDD4CF]" 
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  ROYALHOOF
                </div>
                <div className="text-[0.625rem] tracking-[0.2em] uppercase text-[#DDD4CF]" 
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Horse Riding
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isOnAdminPanel && (
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map(item => (
                <Link key={item.to} to={item.to} onClick={closeAll}
                  className="px-5 h-10 flex items-center text-[0.8125rem] font-medium tracking-wide text-[#DDD4CF]/80 hover:text-[#DDD4CF] transition-colors duration-300"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop Search */}
          <div ref={searchRef} className="hidden lg:block relative w-72 ml-auto">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F3EBDD]/40 pointer-events-none" />
              <input
                type="text" value={searchQuery} onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full rounded-sm pl-11 pr-4 py-2.5 text-sm text-[#F3EBDD] placeholder-[#F3EBDD]/30 focus:outline-none transition-all duration-300"
                style={{
                  background: "rgba(44, 44, 44, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </form>
            {suggestions.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 rounded-sm z-50 overflow-hidden"
                style={{ 
                  background: "#2C2C2C", 
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)" 
                }}>
                {suggestions.map(p => (
                  <button key={p.id} onClick={() => handleSuggestionClick(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#171614] transition-colors text-left">
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-sm flex-shrink-0" 
                        onError={e => { e.target.style.display = "none" }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F3EBDD] text-sm font-medium truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</p>
                      <p className="text-[#B6A58F] text-xs">{p.category}</p>
                    </div>
                    <span className="text-[#F3EBDD] text-sm font-semibold flex-shrink-0">
                      {p.price?.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto lg:ml-0">
            {isAdmin && (
              <Link to={isOnAdminPanel ? "/" : "/admin"}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-[0.6875rem] font-semibold rounded-sm transition-all mr-2 tracking-wide uppercase"
                style={{ 
                  background: "#D8C7AE", 
                  color: "#171614",
                  fontFamily: "'Inter', sans-serif" 
                }}>
                {isOnAdminPanel ? <><Store size={13} /> User</> : <><Settings size={13} /> Admin</>}
              </Link>
            )}

            {/* Hamburger button */}
            <button 
              className="lg:hidden p-2 transition-colors"
              style={{ color: "#DDD4CF", background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar rendered at document.body level via portal */}
      {mobileSidebar}
    </>
  )
}
