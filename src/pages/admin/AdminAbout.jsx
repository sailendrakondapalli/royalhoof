import { useState, useEffect, useRef } from "react"
import { Save, Loader2, RefreshCw, Upload, X } from "lucide-react"
import { getSetting, setSetting } from "../../services/settingsService"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

const CARD_BG = "#242120"
const CARD_BORDER = "rgba(255,255,255,0.07)"
const TEXT_PRIMARY = "#F3EBDD"
const TEXT_MUTED = "rgba(243,235,221,0.45)"
const ACCENT = "#D8C7AE"

const DEFAULT = {
  title: "Royal Hoof Horse Riding Academy",
  subtitle: "Nallambakkam, Tamil Nadu",
  p1: "Welcome to Royal Hoof Horse Riding Academy, located at GIRI FARMS in Nallambakkam, Tamil Nadu. We offer professional horse riding lessons for all ages in a safe, nurturing environment.",
  p2: "Our certified trainers are passionate about equestrian sports and dedicated to building a strong foundation for every rider — from complete beginners to experienced equestrians.",
  p3: "We offer a wide range of programmes including beginner lessons, advanced training, competitive riding, and special kids' sessions designed to build confidence and develop lifelong skills.",
  p4: "Safety is our top priority. All sessions are supervised by experienced professionals, and our horses are well-trained, healthy, and temperament-tested for rider compatibility.",
  p5: "Located conveniently within the Uniworld City, Aspen Greens community, our facility is equipped with quality arena space, stables, and training equipment.",
  p6: "Join our growing family of riders and experience the joy, freedom, and discipline that horse riding brings.",
  years: "GIRI FARMS",
  yearsLabel: "Our Home",
  authentic: "All Ages",
  authenticLabel: "Welcome",
  customers: "Mon – Sun",
  customersLabel: "6 AM – 8 PM",
}

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 5,
  padding: "9px 12px",
  color: TEXT_PRIMARY,
  fontSize: "0.875rem",
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
}

const labelStyle = {
  display: "block",
  color: TEXT_MUTED,
  fontSize: "0.6875rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 5,
  fontFamily: "'Inter', sans-serif",
}

export default function AdminAbout() {
  const [data, setData] = useState(DEFAULT)
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    Promise.all([
      getSetting("about_section_en").catch(() => null),
      getSetting("about_image_url").catch(() => null),
    ]).then(([content, img]) => {
      if (content) { try { setData({ ...DEFAULT, ...JSON.parse(content) }) } catch {} }
      if (img) setImageUrl(img)
      setLoading(false)
    })
  }, [])

  const set = (key, val) => setData(d => ({ ...d, [key]: val }))

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return }

    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const fileName = `about_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(`about/${fileName}`, file, { cacheControl: "3600", upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(`about/${fileName}`)
      setImageUrl(urlData.publicUrl)
      toast.success("Image uploaded!")
    } catch (err) {
      toast.error(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        setSetting("about_section_en", JSON.stringify(data)),
        setSetting("about_image_url", imageUrl),
      ])
      toast.success("About section saved! Changes are live on the website.")
    } catch (err) {
      toast.error(err.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setData(DEFAULT)
    toast.success("Reset to defaults — click Save to apply")
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
        <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
      </div>
    )
  }

  const fields = [
    { key: "title", label: "Academy Name / Title", rows: 1 },
    { key: "subtitle", label: "Subtitle / Tagline", rows: 1 },
    { key: "p1", label: "Paragraph 1", rows: 3 },
    { key: "p2", label: "Paragraph 2", rows: 3 },
    { key: "p3", label: "Paragraph 3", rows: 3 },
    { key: "p4", label: "Paragraph 4", rows: 2 },
    { key: "p5", label: "Paragraph 5", rows: 2 },
    { key: "p6", label: "Paragraph 6", rows: 2 },
  ]

  const stats = [
    { v: "years", l: "yearsLabel", labelText: "Stat 1 Value & Label" },
    { v: "authentic", l: "authenticLabel", labelText: "Stat 2 Value & Label" },
    { v: "customers", l: "customersLabel", labelText: "Stat 3 Value & Label" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: TEXT_PRIMARY }}>
            About Section
          </h1>
          <p style={{ color: TEXT_MUTED, fontSize: "0.875rem", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>
            Edit the About Us content on the homepage. Changes are live instantly after saving.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleReset}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", color: TEXT_MUTED, border: `1px solid ${CARD_BORDER}`, borderRadius: 4, padding: "8px 16px", cursor: "pointer", fontSize: "0.8125rem", fontFamily: "'Inter', sans-serif" }}>
            <RefreshCw size={13} /> Reset
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6, background: saving ? "rgba(216,199,174,0.5)" : ACCENT, color: "#171614", border: "none", borderRadius: 4, padding: "8px 20px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.8125rem", fontFamily: "'Inter', sans-serif" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Two column layout: form + live preview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }} className="about-grid">

        {/* LEFT — Edit form */}
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ color: ACCENT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            Content
          </p>

          {/* Image upload */}
          <div>
            <label style={labelStyle}>About Section Image</label>
            {imageUrl ? (
              <div style={{ position: "relative", marginBottom: 10 }}>
                <img src={imageUrl} alt="About" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 6, border: `1px solid ${CARD_BORDER}` }} />
                <button
                  onClick={() => setImageUrl("")}
                  style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed rgba(216,199,174,0.2)`, borderRadius: 6, padding: "24px", textAlign: "center", cursor: "pointer", marginBottom: 10 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(216,199,174,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(216,199,174,0.2)"}
              >
                {uploading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: ACCENT }} />
                    <span style={{ color: TEXT_MUTED, fontSize: "0.875rem" }}>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload size={22} style={{ color: TEXT_MUTED, margin: "0 auto 8px" }} />
                    <p style={{ color: TEXT_MUTED, fontSize: "0.875rem" }}>Click to upload image</p>
                    <p style={{ color: "rgba(243,235,221,0.25)", fontSize: "0.75rem", marginTop: 4 }}>JPG, PNG, WEBP · max 10MB</p>
                  </>
                )}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            <div>
              <label style={{ ...labelStyle, marginTop: 6 }}>Or paste image URL</label>
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
            </div>
          </div>

          {/* Text fields */}
          {fields.map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              {f.rows === 1
                ? <input value={data[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
                : <textarea rows={f.rows} value={data[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
              }
            </div>
          ))}

          {/* Stats */}
          <div style={{ borderTop: `1px solid ${CARD_BORDER}`, paddingTop: 16 }}>
            <p style={{ ...labelStyle, fontSize: "0.75rem", marginBottom: 12 }}>Stats / Highlights (3 cards)</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.map(s => (
                <div key={s.v} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Value</label>
                    <input value={data[s.v] || ""} onChange={e => set(s.v, e.target.value)} style={inputStyle} placeholder="e.g. 25+" />
                  </div>
                  <div>
                    <label style={labelStyle}>Label</label>
                    <input value={data[s.l] || ""} onChange={e => set(s.l, e.target.value)} style={inputStyle} placeholder="e.g. Years Experience" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Live preview */}
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 24, position: "sticky", top: 80 }}>
          <p style={{ color: ACCENT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>
            Live Preview
          </p>

          {/* Preview card */}
          <div style={{ background: "#1A1714", borderRadius: 8, padding: 20, border: `1px solid rgba(255,255,255,0.05)` }}>
            {/* Eyebrow */}
            <p style={{ textAlign: "center", fontSize: "0.6875rem", letterSpacing: "0.25em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 }}>
              About Us
            </p>

            {/* Title */}
            <h2 style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.375rem", fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 4 }}>
              {data.title || "Academy Name"}
            </h2>
            <p style={{ textAlign: "center", color: TEXT_MUTED, fontSize: "0.8125rem", marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
              {data.subtitle}
            </p>

            {/* Image preview */}
            {imageUrl ? (
              <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: 6, marginBottom: 16 }}>
                <img src={imageUrl} alt="About" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ width: "100%", aspectRatio: "16/9", background: "rgba(255,255,255,0.04)", borderRadius: 6, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: TEXT_MUTED, fontSize: "0.75rem" }}>No image selected</p>
              </div>
            )}

            {/* Paragraphs preview (first 2) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {[data.p1, data.p2].map((p, i) => p ? (
                <p key={i} style={{ color: "rgba(216,199,174,0.8)", fontSize: "0.8125rem", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                  {p}
                </p>
              ) : null)}
              {(data.p3 || data.p4 || data.p5 || data.p6) && (
                <p style={{ color: TEXT_MUTED, fontSize: "0.75rem", fontStyle: "italic" }}>+ more paragraphs below...</p>
              )}
            </div>

            {/* Stats preview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {stats.map(s => (
                <div key={s.v} style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", border: `1px solid ${CARD_BORDER}`, borderRadius: 6, padding: "12px 8px" }}>
                  <p style={{ color: ACCENT, fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 700 }}>{data[s.v] || "—"}</p>
                  <p style={{ color: TEXT_MUTED, fontSize: "0.625rem", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{data[s.l] || "Label"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
