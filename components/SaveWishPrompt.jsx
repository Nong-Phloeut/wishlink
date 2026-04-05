'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Swapped Chrome for Globe to avoid the "Export doesn't exist" error
import { Send, Globe, BellRing, X, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function SaveWishPrompt({ wish }) {
  const [dismissed, setDismissed] = useState(false)
  const [mode, setMode] = useState('initial') 
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') 

  if (dismissed) return null

  const handleAction = async (type) => {
    setStatus('loading')
    try {
      // Simulate API call logic
      await new Promise((r) => setTimeout(r, 1200))
      setStatus('success')
    } catch (error) {
      setStatus('idle')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-emerald-50/50 p-6 backdrop-blur-sm mt-6 mb-2"
      >
        <button 
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-4 p-1 text-emerald-900/30 hover:text-emerald-900/60 transition-colors"
        >
          <X size={20} />
        </button>

        {status !== 'success' ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm shadow-emerald-200/50">
                <BellRing size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-emerald-950">Track this wish</h3>
                <p className="text-[12px] text-emerald-700/70 leading-tight">Get notified when {wish.recipient} scans it</p>
              </div>
            </div>

            {mode === 'initial' ? (
              <div className="grid grid-cols-1 gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => handleAction('telegram')}
                    className="flex-1 gap-2 rounded-2xl border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-700 h-11 shadow-sm active:scale-95 transition-transform"
                  >
                    <Send size={16} className="text-[#229ED9]" />
                    <span className="text-[13px] font-bold">Telegram</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleAction('google')}
                    className="flex-1 gap-2 rounded-2xl border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-700 h-11 shadow-sm active:scale-95 transition-transform"
                  >
                    <Globe size={16} className="text-[#4285F4]" />
                    <span className="text-[13px] font-bold">Google</span>
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => setMode('email')}
                  className="text-[11px] text-emerald-700/60 hover:text-emerald-700 hover:bg-transparent h-8 font-semibold tracking-wide"
                >
                  OR USE EMAIL ADDRESS
                </Button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <div className="flex gap-2">
                  <Input 
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-2xl border-emerald-200 bg-white focus-visible:ring-emerald-500 text-[15px]"
                  />
                  <Button 
                    onClick={() => handleAction('email')}
                    disabled={status === 'loading' || !email.includes('@')}
                    className="h-11 px-6 rounded-2xl bg-[#1D9E75] hover:bg-[#178060] text-white font-bold"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
                  </Button>
                </div>
                <button 
                  onClick={() => setMode('initial')}
                  className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.15em] block w-full text-center"
                >
                  ← Back to Social Options
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-2 text-center"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-[16px] font-bold text-emerald-950">Alerts Activated!</h3>
            <p className="text-[13px] text-emerald-700/80 mt-1 px-4 leading-relaxed">
              We'll notify you the moment <strong>{wish.recipient}</strong> scans the QR code.
            </p>
            <Button 
              variant="ghost" 
              onClick={() => setDismissed(true)}
              className="mt-4 text-[11px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-100/50"
            >
              Done
            </Button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}