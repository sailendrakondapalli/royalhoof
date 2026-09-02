import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, ChevronLeft, ChevronRight, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { fetchProducts } from '../services/productService'
import { getSetting } from '../services/settingsService'
import { useCategoryStore } from '../store/categoryStore'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
]

const PAGE_SIZE_OPTIONS = [8, 12, 24, 48]
const DEFAULT_PAGE_SIZE = 12

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [page, setPage] = useState(1)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef(null)
  const isMobile = useIsMobile()

  // Default: list on desktop, grid on mobile
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 'list' : 'grid'
  )

  const { categories, loadCategories } = useCategoryStore()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'

  useEffect(() => {
    getSetting('products_per_page').then(val => {
      const n = parseInt(val)
      if (n && PAGE_SIZE_OPTIONS.includes(n)) setPageSize(n)
    }).catch(() => {})
    loadCategories()
  }, [])

  useEffect(() => { setPage(1) }, [category, search, sort, pageSize])

  const matchedCategory = categories.find(c => c.toLowerCase() === search.toLowerCase())

  useEffect(() => {
    if (matchedCategory && !category) {
      const params = new URLSearchParams(searchParams)
      params.set('category', matchedCategory)
      params.delete('search')
      setSearchParams(params, { replace: true })
      return
    }
    setLoading(true)
    fetchProducts({ category, search, sort }).then(data => {
      setProducts(data)
      setLoading(false)
    })
  }, [category, search, sort])

  // Close sort dropdown on outside click
  useEffect(() => {
    const fn = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const clearFilters = () => setSearchParams({})
  const hasFilters = !!(category || search)

  const totalPages = Math.ceil(products.length / pageSize)
  const pagedProducts = products.slice((page - 1) * pageSize, page * pageSize)

  const pageTitle = category ? `${category} ? Royal Hoof` : 'All Horse Riding ? Royal Hoof'
  const headingText = category || 'All Horse Riding'

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Shop ${category || 'all'} Horse Riding at Royal Hoof. Authentic certified sacred beads from Nepal & Java.`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* -- TOP BAR ROW 1: Title + result count + view toggle -- */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#C8860A] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              {headingText}
            </h1>
            {search && (
              <p className="text-[#DDB87A] text-sm mt-0.5">
                Results for: <span className="text-[#E5A020] font-semibold">"{search}"</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            {/* Result count */}
            <span className="text-[#8B6A4A] text-xs hidden sm:block">
              {loading ? '?' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
            </span>

            {/* View toggle */}
            <div className="flex items-center bg-[#2A1408] rounded-lg p-0.5 border border-[#5C3015]">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#C8860A] text-[#1A0A02] shadow-sm' : 'text-[#DDB87A] hover:text-[#C8860A]'}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#C8860A] text-[#1A0A02] shadow-sm' : 'text-[#DDB87A] hover:text-[#C8860A]'}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* -- TOP BAR ROW 2: Category pills + sort -- */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {/* Scrollable category pills */}
          <div className="flex items-center gap-1.5 flex-nowrap min-w-0 flex-1">
            <button
              onClick={() => setFilter('category', '')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                !category
                  ? 'bg-[#C8860A] text-[#1A0A02] border-[#C8860A] shadow-sm'
                  : 'bg-[#2A1408] text-[#DDB87A] hover:text-[#C8860A] border-[#5C3015] hover:border-[#C8860A]/60'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter('category', cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  category === cat || search.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#C8860A] text-[#1A0A02] border-[#C8860A] shadow-sm'
                    : 'bg-[#2A1408] text-[#DDB87A] hover:text-[#C8860A] border-[#5C3015] hover:border-[#C8860A]/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right: clear + sort */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#DDB87A] hover:text-red-400 transition-colors whitespace-nowrap"
              >
                <X size={12} /> Clear
              </button>
            )}

            {/* Custom sort dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-1.5 bg-[#2A1408] border border-[#5C3015] text-[#DDB87A] text-xs rounded-lg px-3 py-2 hover:border-[#C8860A]/60 transition-colors whitespace-nowrap"
              >
                <SlidersHorizontal size={12} />
                {SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort'}
                <ChevronDown size={11} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-full mt-1.5 w-44 bg-[#2A1408] border border-[#5C3015] rounded-xl shadow-xl z-30 py-1.5 overflow-hidden"
                  >
                    {SORT_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => { setFilter('sort', o.value); setSortOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                          sort === o.value
                            ? 'bg-[#3D1F0A] text-[#C8860A] font-semibold'
                            : 'text-[#DDB87A] hover:bg-[#3D1F0A] hover:text-[#C8860A]'
                        }`}
                      >
                        {o.value === sort && <span className="mr-1">?</span>}
                        {o.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* -- MAIN LAYOUT: sidebar (desktop) + content -- */}
        <div className="flex gap-6">

          {/* Sticky sidebar ? desktop only */}
          <aside className="hidden lg:block w-[220px] flex-shrink-0">
            <div className="sticky top-20 bg-[#2A1408] rounded-2xl border border-[#5C3015] overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-[#C8860A]">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#1A0A02]">Categories</h2>
              </div>
              <nav className="py-2">
                <button
                  onClick={() => setFilter('category', '')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left ${
                    !category
                      ? 'text-[#C8860A] font-semibold bg-[#3D1F0A] border-l-2 border-[#C8860A]'
                      : 'text-[#DDB87A] hover:text-[#C8860A] hover:bg-[#3D1F0A]'
                  }`}
                >
                  <span>All</span>
                  <span className="text-[10px] text-[#DDB87A] bg-[#1A0A02] px-1.5 py-0.5 rounded-full border border-[#5C3015]">
                    {loading ? '?' : products.length}
                  </span>
                </button>
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat).length
                  const active = category === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilter('category', cat)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left ${
                        active
                          ? 'text-[#C8860A] font-semibold bg-[#3D1F0A] border-l-2 border-[#C8860A]'
                          : 'text-[#DDB87A] hover:text-[#C8860A] hover:bg-[#3D1F0A]'
                      }`}
                    >
                      <span className="truncate pr-2">{cat}</span>
                      {count > 0 && (
                        <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${
                          active ? 'bg-[#C8860A] text-[#1A0A02]' : 'text-[#DDB87A] bg-[#1A0A02] border border-[#5C3015]'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Product list/grid area */}
          <div className="flex-1 min-w-0">

            {/* Per-page selector + count */}
            {!loading && products.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#DDB87A] text-xs">
                  Showing <span className="text-[#C8860A] font-medium">{(page - 1) * pageSize + 1}?{Math.min(page * pageSize, products.length)}</span> of <span className="text-[#C8860A] font-medium">{products.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[#DDB87A] text-xs hidden sm:block">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                    className="bg-[#2A1408] border border-[#5C3015] text-[#DDB87A] text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C8860A]"
                  >
                    {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loading ? (
              viewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                  {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} layout="list" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array(pageSize).fill(0).map((_, i) => <SkeletonCard key={i} layout="grid" />)}
                </div>
              )
            ) : products.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <span className="text-6xl mb-4 leading-none">??</span>
                <h3 className="text-[#C8860A] text-lg font-bold mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                  No Horse Riding Found
                </h3>
                <p className="text-[#DDB87A] text-sm mb-6 max-w-xs">
                  {search
                    ? `We couldn't find any products matching "${search}". Try a different keyword or browse categories.`
                    : 'No products in this category yet. Check back soon or browse all.'}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-[#C8860A] text-[#1A0A02] rounded-xl text-sm font-semibold hover:bg-[#E5A020] transition-all shadow-md hover:shadow-[0_4px_16px_rgba(200,134,10,0.4)]"
                >
                  Browse All Horse Riding
                </button>
              </motion.div>
            ) : (
              <>
                {/* Products */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className={
                      viewMode === 'list'
                        ? 'flex flex-col gap-3'
                        : 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                    }
                  >
                    {pagedProducts.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      >
                        <ProductCard product={p} layout={isMobile ? 'grid' : viewMode} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                    <button
                      onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg border border-[#5C3015] text-[#DDB87A] hover:border-[#C8860A] disabled:opacity-40 transition-all"
                    >
                      <ChevronLeft size={13} /> Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('?')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, idx) =>
                        p === '?'
                          ? <span key={`ellipsis-${idx}`} className="text-[#8B6A4A] text-xs px-1">?</span>
                          : (
                            <button
                              key={p}
                              onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                              className={`w-8 h-8 text-xs rounded-lg border transition-all ${
                                p === page
                                  ? 'bg-[#C8860A] text-[#1A0A02] border-[#C8860A] shadow-sm'
                                  : 'border-[#5C3015] text-[#DDB87A] hover:border-[#C8860A]'
                              }`}
                            >
                              {p}
                            </button>
                          )
                      )
                    }
                    <button
                      onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg border border-[#5C3015] text-[#DDB87A] hover:border-[#C8860A] disabled:opacity-40 transition-all"
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
