import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroAnimation({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)
  const canvasRef = useRef(null)

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

    // Auto-complete after 4 seconds
    const timer = setTimeout(() => {
      handleComplete()
    }, 4000)

    return () => {
      clearTimeout(timer)
      if (dotLottie) {
        dotLottie.destroy()
      }
    }
  }, [])

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => onComplete?.(), 500)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
        style={{ 
          background: 'linear-gradient(135deg, #16080B 0%, #210B10 25%, #16080B 50%, #0E0507 75%, #16080B 100%)',
          backgroundSize: '400% 400%',
          animation: 'smokeGradient 8s ease infinite'
        }}
        onClick={handleComplete}
      >
        <style>{`
          @keyframes smokeGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        
        <div className="relative flex flex-col items-center justify-center">
          {/* Horse Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center"
          >
            <canvas 
              ref={canvasRef}
              width={400}
              height={400}
              style={{ 
                width: '400px', 
                height: '400px',
                maxWidth: '90vw',
                maxHeight: '90vw',
                filter: 'brightness(0) invert(1)' // Makes it white
              }}
            />
          </motion.div>
          
          {/* Brand text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="mt-8 text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-[0.06em] mb-4" 
                style={{ 
                  fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
                  background: 'linear-gradient(180deg, #A88628 0%, #E0C15A 50%, #C9A227 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 8px rgba(212, 175, 55, 0.4)',
                  letterSpacing: '0.06em',
                  fontWeight: 500
                }}>
              ROYAL HOOF
            </h1>
            <p className="text-xl md:text-2xl tracking-[0.10em] uppercase font-light" 
               style={{ 
                 fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
                 color: '#E0C15A',
                 letterSpacing: '0.10em',
                 textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
                 fontWeight: 400
               }}>
              Horse Riding Academy & Club
            </p>
            <p className="text-sm md:text-base tracking-[0.15em] uppercase mt-3" 
               style={{ 
                 fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
                 color: '#E0C15A',
                 letterSpacing: '0.15em',
                 textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
                 fontWeight: 400,
                 fontSize: '0.75rem'
               }}>
              ESTD. 2026
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
