'use client'
import { useState } from 'react'
import { X, Tag, CheckCircle2, Loader2, Sparkles, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from "next-intl"

export default function CouponModal({ onClose, onUpgraded, wishId }) {
  const t = useTranslations("upgrade") // Reuse upgrade translations if available or local
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
        }, 2000)
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
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          className="w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl overflow-hidden"
        >
          {/* Header Area */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
            <div className="w-6" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:bg-stone-100 transition-colors mt-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 pb-10">
            {!isSuccess ? (
              <>
                {/* Hero Section */}
                <div className="flex items-center gap-4 mb-6 pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#1D9E75] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#1D9E75]/30">
                    <Tag size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[17px] font-bold text-stone-900">
                      Redeem Coupon
                    </h2>
                    <p className="text-[12px] text-stone-400">Unlock premium features with your code</p>
                  </div>
                </div>

                {/* Input Area */}
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value)
                        setError('')
                      }}
                      placeholder="ENTER CODE"
                      className={`w-full h-14 bg-stone-50 border-2 rounded-2xl px-6 text-center text-[15px] font-bold tracking-[0.2em] outline-none transition-all placeholder:tracking-normal ${
                        error ? 'border-red-200 text-red-500' : 'border-stone-100 focus:border-[#1D9E75] text-stone-800'
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
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-center text-[11px] font-bold text-red-500"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleApply}
                    disabled={loading || code.length < 3}
                    className="w-full h-12 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-white text-[14px] font-bold disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-[#1D9E75]/20"
                  >
                    {loading ? "Checking..." : "Apply & Unlock"}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] font-bold text-[#1D9E75] uppercase tracking-widest opacity-80">
                    <Sparkles size={11} />
                    Instant Premium Access
                  </div>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="flex flex-col items-center text-center pt-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-16 h-16 rounded-full bg-[#F0FDF8] flex items-center justify-center mb-4"
                >
                  <CheckCircle2 size={32} className="text-[#1D9E75]" />
                </motion.div>
                <h2 className="text-[20px] font-bold text-stone-900 mb-1">
                  Premium Unlocked!
                </h2>
                <p className="text-[13px] text-stone-400 leading-relaxed px-6">
                  Your code was accepted. You can now add photos, videos and more to your wish.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}