'use client'
import { useState } from 'react'
import { X, Tag, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from "next-intl"

export default function CouponModal({ onClose, onUpgraded, wishId }) {
  const t = useTranslations("upgrade")
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleApply = async () => {
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return setError("Please enter a code")

    setLoading(true)
    setError('')

    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, wishId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid coupon code")
      } else {
        setIsSuccess(true)
        setTimeout(() => {
          onUpgraded?.()
          onClose?.()
        }, 1800)
      }
    } catch (err) {
      setError("Server error. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm p-0"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
          className="w-full max-w-[430px] bg-white rounded-t-[2rem] shadow-2xl relative"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        >
          {/* Handle Bar */}
          <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-3 mb-2" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-full text-stone-400 hover:bg-stone-50 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="px-6">
            {!isSuccess ? (
              <div className="pt-2">
                {/* Header: Matches Payment Modal Style */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#1D9E75] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#1D9E75]/20">
                    <Tag size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[17px] font-bold text-stone-900 leading-tight">
                      Redeem Coupon
                    </h2>
                    <p className="text-[12px] text-stone-400">Enter code to unlock premium</p>
                  </div>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value)
                        setError('')
                      }}
                      placeholder="CODE2026"
                      className={`w-full h-14 bg-stone-50 border-2 rounded-2xl px-6 text-center text-[16px] font-bold tracking-[0.1em] outline-none transition-all ${
                        error 
                          ? 'border-red-200 text-red-500 focus:border-red-300' 
                          : 'border-stone-100 focus:border-[#1D9E75] text-stone-800'
                      }`}
                      autoFocus
                    />
                    {loading && (
                      <div className="absolute right-4 top-4">
                        <Loader2 size={18} className="animate-spin text-[#1D9E75]" />
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="text-center text-[11px] font-bold text-red-500 bg-red-50 py-2 rounded-lg"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleApply}
                    disabled={loading || code.length < 3}
                    className="w-full h-12 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[14px] font-bold disabled:opacity-30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? "Verifying..." : "Apply Coupon"}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] font-black text-[#1D9E75] uppercase tracking-[0.15em] opacity-70">
                    <Sparkles size={11} />
                    Instant Activation
                  </div>
                </div>
              </div>
            ) : (
              /* Success State: Identical to Payment Success */
              <div className="flex flex-col items-center text-center py-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 rounded-full bg-[#F0FDF8] flex items-center justify-center mb-4"
                >
                  <CheckCircle2 size={32} className="text-[#1D9E75]" />
                </motion.div>
                <h2 className="text-[20px] font-bold text-stone-900 mb-1">
                  Premium Unlocked!
                </h2>
                <p className="text-[13px] text-stone-400 leading-relaxed max-w-[240px]">
                  Your wish has been upgraded. You can now use all premium features.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}