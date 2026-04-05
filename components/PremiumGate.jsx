'use client'
import { useState } from 'react'
import { Lock, Sparkles } from 'lucide-react'
import UpgradeModal from './UpgradeModal'

export default function PremiumGate({ wishId, children, feature = 'This feature' }) {
  const [showModal, setShowModal] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  if (unlocked) return children

  return (
    <>
      <div className="relative">
        {/* Blurred children preview */}
        <div className="pointer-events-none select-none" style={{ filter: 'blur(3px)', opacity: 0.4 }}>
          {children}
        </div>

        {/* Lock overlay */}
        <div
          onClick={() => setShowModal(true)}
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer rounded-xl bg-white/60 backdrop-blur-[2px] border-2 border-dashed border-[#1D9E75]/30 hover:border-[#1D9E75] transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center mb-2 group-hover:bg-[#1D9E75]/20 transition-colors">
            <Lock size={18} className="text-[#1D9E75]" />
          </div>
          <p className="text-[12px] font-bold text-stone-600">{feature}</p>
          <div className="flex items-center gap-1 mt-1.5 bg-[#1D9E75] text-white rounded-full px-3 py-1">
            <Sparkles size={11} />
            <span className="text-[10px] font-bold">Upgrade — $1</span>
          </div>
        </div>
      </div>

      {showModal && (
        <UpgradeModal
          wishId={wishId}
          onClose={() => setShowModal(false)}
          onUpgraded={() => {
            setUnlocked(true)
            setShowModal(false)
          }}
        />
      )}
    </>
  )
}