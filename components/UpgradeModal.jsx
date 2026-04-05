'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Video, Images, Music, Download, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const FEATURES = [
  { icon: Video,    label: 'Video message',       desc: 'Record or upload a personal video' },
  { icon: Images,   label: 'Up to 6 photos',      desc: 'Create a beautiful photo slideshow' },
  { icon: Music,    label: 'Background music',     desc: 'Add a song to your wish' },
  { icon: Download, label: 'High-res QR download', desc: 'Print-ready QR for cards & gifts' },
]

const PRICE = 1.00
const CURRENCY = 'USD'

export default function UpgradeModal({ wishId, onClose, onUpgraded }) {
  const [step, setStep]       = useState('plans')   // plans | payment | success
  const [loading, setLoading] = useState(false)
  const [paymentId, setPaymentId] = useState(null)
  const [txRef, setTxRef]     = useState('')

  const handleStartPayment = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          wish_id: wishId,
          amount: PRICE,
          currency: CURRENCY,
          status: 'pending',
          payment_method: 'aba',
        }])
        .select()
        .single()
      if (error) throw error
      setPaymentId(data.id)
      setStep('payment')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!txRef.trim()) return
    setLoading(true)
    try {
      await supabase
        .from('payments')
        .update({ status: 'paid', transaction_ref: txRef.trim(), paid_at: new Date().toISOString() })
        .eq('id', paymentId)

      await supabase
        .from('wishes')
        .update({ is_premium: true })
        .eq('id', wishId)

      setStep('success')
      setTimeout(() => { onUpgraded?.(); onClose?.() }, 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {/* z-[200] ensures it sits above the bottom nav (z-50) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          className="w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl"
          style={{ maxHeight: '88vh', overflowY: 'auto' }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
            <div className="w-10 h-1 bg-stone-200 rounded-full" />
          </div>

          {/* Close */}
          <div className="flex justify-end px-5 pt-1 sticky top-5 bg-transparent z-10">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Step: plans ── */}
          {step === 'plans' && (
            <div className="px-5 pb-10">
              {/* Hero */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#1D9E75] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#1D9E75]/30">
                  <Sparkles size={26} className="text-white" />
                </div>
                <h2 className="text-[20px] font-bold text-stone-900 mb-1">Upgrade this wish</h2>
                <p className="text-[13px] text-stone-400">One-time payment · All premium features</p>
              </div>

              {/* Price */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-baseline gap-1 bg-[#F0FDF8] border border-[#A7F3D0] rounded-2xl px-6 py-3">
                  <span className="text-[13px] font-semibold text-[#059669]">USD</span>
                  <span className="text-[40px] font-black text-[#1D9E75] leading-none">$1</span>
                  <span className="text-[13px] text-[#059669]">/ wish</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-7">
                {FEATURES.map((f) => (
                  <div key={f.label} className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center flex-shrink-0">
                      <f.icon size={16} className="text-[#1D9E75]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-stone-700">{f.label}</p>
                      <p className="text-[11px] text-stone-400">{f.desc}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-[#1D9E75] flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* ABA Pay CTA — single button, no method selector */}
              <button
                onClick={handleStartPayment}
                disabled={loading}
                className="w-full flex items-center gap-3 bg-[#E31837] hover:bg-[#c01430] active:scale-[0.98] rounded-2xl px-5 py-4 transition-all disabled:opacity-60"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🏦</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[15px] font-bold text-white">Pay with ABA Pay</p>
                  <p className="text-[11px] text-white/70">Scan QR in your ABA mobile app</p>
                </div>
                {loading
                  ? <Loader2 size={18} className="animate-spin text-white" />
                  : <span className="text-white font-bold text-lg">→</span>
                }
              </button>

              <p className="text-center text-[10px] text-stone-300 mt-4">
                🔒 Secure · One-time only · No subscription
              </p>
            </div>
          )}

          {/* ── Step: payment instructions ── */}
          {step === 'payment' && (
            <div className="px-5 pb-10">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#E31837] flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏦</span>
                </div>
                <h2 className="text-[18px] font-bold text-stone-900">Pay via ABA Pay</h2>
                <p className="text-[12px] text-stone-400 mt-1">
                  Send exactly <span className="font-bold text-stone-700">$1.00 USD</span> to the details below
                </p>
              </div>

              {/* Payment details */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-5 space-y-3">
                <DetailRow label="Account name" value="WishLink KH" />
                <DetailRow label="ABA number"   value="012 345 678" copyable />
                <DetailRow label="Amount"        value="$1.00 USD"   highlight />
                <DetailRow label="Note / Memo"   value={`wish-${wishId}`} copyable />
              </div>

              {/* Steps guide */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 space-y-1.5">
                {[
                  'Open your ABA mobile app',
                  'Tap Pay → enter ABA number above',
                  'Set amount $1.00 and add the memo',
                  'Complete payment and copy the reference',
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold">{i + 1}</span>
                    </div>
                    <span className="text-[12px] text-blue-700">{s}</span>
                  </div>
                ))}
              </div>

              {/* Tx ref input */}
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Paste your transaction reference
              </p>
              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder="e.g. TXN123456789"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-[15px] text-stone-800 placeholder-stone-300 outline-none focus:border-[#1D9E75] mb-4 transition-colors"
              />

              <Button
                onClick={handleConfirmPayment}
                disabled={loading || !txRef.trim()}
                className="w-full h-12 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-[15px] font-bold disabled:opacity-50"
              >
                {loading
                  ? <Loader2 size={18} className="animate-spin" />
                  : "I've paid — Unlock now ✓"
                }
              </Button>

              <button
                onClick={() => setStep('plans')}
                className="w-full text-center text-[11px] text-stone-400 hover:text-stone-600 mt-3 transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* ── Step: success ── */}
          {step === 'success' && (
            <div className="px-5 pb-12 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 rounded-full bg-[#F0FDF8] flex items-center justify-center mb-5 mt-4"
              >
                <CheckCircle2 size={40} className="text-[#1D9E75]" />
              </motion.div>
              <h2 className="text-[22px] font-bold text-stone-900 mb-2">Wish upgraded! 🎉</h2>
              <p className="text-[14px] text-stone-400 leading-relaxed">
                Premium features are now unlocked.<br />Photos and video are ready to add.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function DetailRow({ label, value, copyable, highlight }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-stone-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn('text-[13px] font-semibold', highlight ? 'text-[#1D9E75]' : 'text-stone-700')}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-[10px] font-bold text-[#1D9E75] bg-[#F0FDF8] border border-[#A7F3D0] px-2 py-0.5 rounded-md transition-colors"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}