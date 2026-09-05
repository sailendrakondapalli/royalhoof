import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Edit2, Trash2, LogIn } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"

function StarRating({ value, onChange, size = 20 }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={`transition-colors ${(hovered || value) >= s ? "text-[#C5963A] fill-[#C5963A]" : "text-[#765334]"}`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review, currentUserId, onEdit, onDelete }) {
  const isOwn = review.user_id === currentUserId
  const initials = (review.name || "U").slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#FAF3E4] border border-[#765334] rounded-xl p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#C5963A]/15 border border-[#C5963A]/30 flex items-center justify-center text-[#C5963A] text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-[#082B49] text-sm font-semibold">{review.name || "Customer"}</p>
            <p className="text-[#765334] text-xs">{new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size={13} />
          {isOwn && (
            <div className="flex gap-1 ml-1">
              <button onClick={() => onEdit(review)} className="text-[#765334] hover:text-[#C5963A] transition-colors"><Edit2 size={13} /></button>
              <button onClick={() => onDelete(review.id)} className="text-[#765334] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
            </div>
          )}
        </div>
      </div>
      <p className="text-[#292725] text-sm mt-3 leading-relaxed">{review.review}</p>
    </motion.div>
  )
}

export default function ReviewsSection() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  // Anonymous review fields
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")

  const userReview = reviews.find(r => r.user_id === user?.id)
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  useEffect(() => {
    // Only fetch approved testimonials for public display
    supabase.from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => { 
        if (error) {
          console.error('Error loading reviews:', error)
        }
        setReviews(data || [])
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) { toast.error("Please write a comment"); return }
    
    // For anonymous users, require name
    if (!user && !guestName.trim()) { 
      toast.error("Please enter your name"); 
      return 
    }
    
    setSubmitting(true)
    try {
      let userName, userId
      
      if (user) {
        // Logged-in user
        userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer"
        userId = user.id
      } else {
        // Anonymous user
        userName = guestName.trim()
        userId = null // No user ID for anonymous reviews
      }
      
      if (editingId) {
        const { data, error } = await supabase.from("testimonials")
          .update({ rating, review: comment.trim() })
          .eq("id", editingId).select().single()
        if (error) throw error
        setReviews(p => p.map(r => r.id === editingId ? data : r))
        toast.success("Review updated!")
      } else {
        const reviewData = {
          user_id: userId,
          name: userName,
          rating,
          review: comment.trim(),
          is_approved: false, // All reviews start as unapproved for admin moderation
          is_active: true,
          display_order: 0
        }
        
        // Add email for anonymous users
        if (!user && guestEmail.trim()) {
          reviewData.guest_email = guestEmail.trim()
        }
        
        const { data, error } = await supabase.from("testimonials")
          .insert(reviewData)
          .select().single()
        if (error) throw error
        
        // Don't add to display list immediately - needs admin approval first
        toast.success("Review submitted! It will be visible after admin approval.")
      }
      
      // Reset form
      setComment("")
      setRating(5)
      setEditingId(null)
      setShowForm(false)
      setGuestName("")
      setGuestEmail("")
    } catch (e) {
      console.error('Review submission error:', e)
      toast.error(e.message || "Failed to submit review")
    } finally { 
      setSubmitting(false) 
    }
  }

  const handleEdit = (review) => {
    setEditingId(review.id)
    setRating(review.rating)
    setComment(review.review)
    setShowForm(true)
    setTimeout(() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100)
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete your review?")) return
    const { error } = await supabase.from("testimonials").delete().eq("id", id)
    if (!error) { setReviews(p => p.filter(r => r.id !== id)); toast.success("Review deleted") }
    else toast.error("Failed to delete")
  }

  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="eyebrow-label mb-2">What Our Customers Say</p>
        <h2 className="heading-editorial text-3xl sm:text-4xl">Real Reviews</h2>
        {avgRating && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <StarRating value={Math.round(Number(avgRating))} size={20} />
            <span className="text-[#C5963A] font-bold text-xl">{avgRating}</span>
            <span className="text-[#765334] text-sm">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
          </div>
        )}
      </div>

      {/* Write review CTA */}
      {!userReview && !showForm && (
        <div className="text-center mb-8">
          <button onClick={() => setShowForm(true)}
            className="btn-gold-equestrian">
            Write a Review
          </button>
          {!user && (
            <p className="text-[#765334] text-xs mt-2">No login required - share your experience!</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form id="review-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="bg-[#FAF3E4] border border-[#765334] rounded-xl p-6 mb-8 space-y-4"
          >
            <p className="text-[#082B49] font-semibold">{editingId ? "Edit your review" : "Share your experience"}</p>
            
            {/* Anonymous user fields */}
            {!user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[#765334] text-xs mb-2 font-medium uppercase tracking-wide">Your Name *</p>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="Enter your name"
                    className="input-premium w-full rounded-sm px-3 py-2.5 text-sm"
                    required
                  />
                </div>
                <div>
                  <p className="text-[#765334] text-xs mb-2 font-medium uppercase tracking-wide">Email (Optional)</p>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-premium w-full rounded-sm px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
            )}
            
            <div>
              <p className="text-[#765334] text-xs mb-2 font-medium uppercase tracking-wide">Your Rating</p>
              <StarRating value={rating} onChange={setRating} size={26} />
            </div>
            <div>
              <p className="text-[#765334] text-xs mb-2 font-medium uppercase tracking-wide">Your Review</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                className="input-premium w-full rounded-sm px-3 py-2.5 text-sm resize-none"
                required
              />
            </div>
            
            {!user && (
              <p className="text-[#765334] text-xs">
                * Your review will be visible after admin approval to ensure quality.
              </p>
            )}
            
            <div className="flex gap-3">
              <button type="button" onClick={() => { 
                setShowForm(false); 
                setEditingId(null); 
                setComment(""); 
                setRating(5);
                setGuestName("");
                setGuestEmail("");
              }}
                className="btn-secondary-equestrian flex-1 py-2.5">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="btn-gold-equestrian flex-1 py-2.5 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <div className="w-3 h-3 border-2 border-[#082B49] border-t-transparent rounded-full animate-spin" />}
                {editingId ? "Update" : "Submit Review"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-[#FAF3E4] border border-[#765334] rounded-xl p-4 h-28 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-[#765334] py-10">No reviews yet. Be the first!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map(r => (
            <ReviewCard key={r.id} review={r} currentUserId={user?.id} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </section>
  )
}
