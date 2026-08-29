import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Heart, Search, Menu, X, User, LogOut, Package, Settings, Store, Languages } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useCartStore } from "../store/cartStore"
import { useAdminStore } from "../store/adminStore"
import { useLanguage } from "../context/LanguageContext"
import { getSetting } from "../services/settingsService"
import logoImg from "../assets/logo.jpg"
import toast from "react-hot-toast"
import { isAdmin as checkIsAdmin } from "./AdminRoute"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [userOpen, setUserOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, signOut } = useAuthStore()
  const cartCount = useCartStore(s => s.getCount())
  const { products, loadProducts } = useAdminStore()
  const { t, toggleLang } = useLanguage()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const userRef = useRef(null)
  const searchRef = useRef(null)
  const canvasRef = useRef(null)
  const isAdmin = checkIsAdmin(user)
  const isOnAdminPanel = pathname.startsWith("/admin")
  const [logoUrl, setLogoUrl] = useState(logoImg)

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
    getSetting("site_logo_url").then(url => { if (url) setLogoUrl(url) }).catch(() => {})
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
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
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

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out successfully")
    navigate("/"); setUserOpen(false); setMenuOpen(false)
  }

  const closeAll = () => { setMenuOpen(false); setUserOpen(false) }

  const navStyle = {
    background: scrolled ? "#2C2C2C" : (pathname === "/" ? "rgba(44, 44, 44, 0.9)" : "#2C2C2C"),
    backdropFilter: scrolled || pathname === "/" ? "blur(20px)" : "none",
    boxShadow: scrolled ? "0 1px 0 rgba(255, 255, 255, 0.1)" : "none",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  }

  const iconStyle = "w-10 h-10 flex items-center justify-center text-[#F3EBDD] hover:text-[#D8C7AE] transition-colors duration-300"

  return (
    <nav className="sticky top-0 z-50 w-full" style={navStyle}>
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
                filter: 'brightness(0) invert(1)' // Makes it white
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
            {[
              { to: "/", label: "Home" },
              { to: "/events", label: "Events" },
              { to: "/packages", label: "Packages" },
              { to: "/gallery", label: "Gallery" },
              { to: "/testimonials", label: "Testimonials" },
              { to: "/faq", label: "FAQ" },
              { to: "/enquiry", label: "Enquiry" },
              { to: "/contact", label: "Contact" },
            ].map(item => (
              <Link key={item.to} to={item.to} onClick={closeAll}
                className="px-5 h-10 flex items-center text-[0.8125rem] font-medium tracking-wide text-[#DDD4CF]/80 hover:text-[#DDD4CF] transition-colors duration-300"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Desktop Search - Hidden as requested */}
        <div ref={searchRef} className="hidden lg:block relative w-72 ml-auto" style={{ display: 'none' }}>
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
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(""); setSuggestions([]) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F3EBDD]/40 hover:text-[#F3EBDD]">
                <X size={14} />
              </button>
            )}
          </form>
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -4 }}
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
              </motion.div>
            )}
          </AnimatePresence>
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

          <button className={`lg:hidden ${iconStyle}`} onClick={() => setMenuOpen(m => !m)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden" 
            style={{ 
              borderTop: "1px solid rgba(255, 255, 255, 0.1)", 
              background: "#2C2C2C" 
            }}>
            <div className="px-6 py-6 flex flex-col gap-2">
              {/* Admin button only */}
              {isAdmin && (
                <div className="mb-4">
                  <Link to={isOnAdminPanel ? "/" : "/admin"}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-semibold w-full justify-center tracking-wide uppercase"
                    style={{ background: "#D8C7AE", color: "#171614", fontFamily: "'Inter', sans-serif" }}
                    onClick={closeAll}>
                    {isOnAdminPanel ? <><Store size={13} /> User</> : <><Settings size={13} /> Admin</>}
                  </Link>
                </div>
              )}

              {/* Mobile Search */}
              <div ref={searchRef} className="relative mb-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F3EBDD]/40 pointer-events-none" />
                  <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Search..." autoFocus
                    className="w-full rounded-sm pl-11 pr-11 py-3 text-sm text-[#F3EBDD] placeholder-[#F3EBDD]/30 focus:outline-none"
                    style={{ 
                      background: "#3A3A3A", 
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      fontFamily: "'Inter', sans-serif" 
                    }} />
                  {searchQuery && (
                    <button type="button" onClick={() => { setSearchQuery(""); setSuggestions([]) }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F3EBDD]/40">
                      <X size={14} />
                    </button>
                  )}
                </form>
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-sm z-50 overflow-hidden"
                      style={{ 
                        background: "#1A1A1A", 
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)" 
                      }}>
                      {suggestions.map(p => (
                        <button key={p.id} onClick={() => { handleSuggestionClick(p); setMenuOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#171614] text-left">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-sm flex-shrink-0" 
                              onError={e => { e.target.style.display = "none" }} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#F3EBDD] text-sm font-medium truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</p>
                            <p className="text-[#B6A58F] text-xs">{p.category}</p>
                          </div>
                          <span className="text-[#F3EBDD] text-sm font-semibold">₹{p.price?.toLocaleString("en-IN")}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {[
                { to: "/", label: "Home" },
                { to: "/events", label: "Events" },
                { to: "/packages", label: "Packages" },
                { to: "/gallery", label: "Gallery" },
                { to: "/testimonials", label: "Testimonials" },
                { to: "/faq", label: "FAQ" },
                { to: "/enquiry", label: "Enquiry" },
                { to: "/contact", label: "Contact" },
              ].map(item => (
                <Link key={item.to} to={item.to} onClick={closeAll}
                  className="py-3 px-3 text-sm font-medium text-[#DDD4CF]/80 hover:text-[#DDD4CF] transition-colors"
                  style={{ 
                    borderBottom: "1px solid rgba(182, 165, 143, 0.1)",
                    fontFamily: "'Cormorant Garamond', serif" 
                  }}>
                  {item.label}
                </Link>
              ))}

              {user && (
                <div className="pt-3">
                  <p className="eyebrow-label px-3 mb-3">My Account</p>
                  <Link to="/profile" className="flex items-center gap-3 py-3 px-3 text-sm text-[#F3EBDD]/70 hover:text-[#F3EBDD]" 
                    style={{ fontFamily: "'Inter', sans-serif" }} onClick={closeAll}>
                    <User size={16} /> {t.profile}
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 py-3 px-3 text-sm text-[#F3EBDD]/70 hover:text-[#F3EBDD]" 
                    style={{ fontFamily: "'Inter', sans-serif" }} onClick={closeAll}>
                    <Package size={16} /> {t.myOrders}
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-3 py-3 px-3 text-sm text-[#F3EBDD]/70 hover:text-[#F3EBDD]" 
                    style={{ fontFamily: "'Inter', sans-serif" }} onClick={closeAll}>
                    <Heart size={16} /> {t.wishlist}
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center gap-3 py-3 px-3 text-sm text-red-400 w-full" 
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    <LogOut size={16} /> {t.logout}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
