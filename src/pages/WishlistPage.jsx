import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlistStore } from '../store/wishlistStore'
import ProductCard from '../components/ProductCard'

export default function WishlistPage() {
  const { items } = useWishlistStore()
  const products = items.map(i => i.products).filter(Boolean)

  if (products.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart size={64} className="text-[#C5963A] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#292725] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Your wishlist is empty</h2>
        <p className="text-[#765334] mb-6">Save beads you love to revisit later</p>
        <Link to="/products" className="px-8 py-3 bg-[#082B49] text-white font-semibold rounded-lg hover:bg-[#0B304D] transition-all">
          Browse Horse Riding
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#292725] mb-8" style={{ fontFamily: 'Georgia, serif' }}>
        My Wishlist <span className="text-[#765334] text-lg font-normal">({products.length})</span>
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
