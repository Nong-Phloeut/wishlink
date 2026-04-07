'use client'
import { Heart, Coffee, Download, Share } from 'lucide-react'

export default function AdminDonation() {
  const qrCodeUrl = "/photo_2026-04-07_15-38-11.jpg" 

  const handleSave = async () => {
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const file = new File([blob], 'WishLink-QR.jpg', { type: 'image/jpeg' })

      // Check if the browser (especially iOS Safari) supports sharing files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'WishLink Support QR',
          text: 'Save this QR to your photos to support WishLink!',
        })
      } else {
        // Fallback for desktop or older browsers
        const link = document.createElement('a')
        link.href = qrCodeUrl
        link.download = 'WishLink-Support-QR.jpg'
        link.click()
      }
    } catch (error) {
      // Final fallback: just open in new tab so they can long-press to save
      window.open(qrCodeUrl, '_blank')
    }
  }

  return (
    <div className="w-full max-w-[400px] mx-auto mt-16 mb-10 px-4">
      <div className="relative overflow-hidden rounded-[3rem] bg-stone-900 p-10 text-white shadow-2xl border border-white/5">
        
        {/* Glow Effect */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
            <Coffee size={28} />
          </div>
          
          <h3 className="text-2xl font-black tracking-tight">
            Keep WishLink Free
          </h3>
          <p className="mt-3 text-sm font-medium text-stone-400 leading-relaxed max-w-[240px]">
            If this surprise made you smile, consider supporting our servers.
          </p>

          {/* QR Area */}
          <div className="mt-8 rounded-[2.5rem] bg-white p-5 shadow-2xl ring-4 ring-white/5">
            <div className="h-64 w-64 overflow-hidden rounded-2xl bg-white">
              <img 
                src={qrCodeUrl} 
                alt="Support Admin QR" 
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* ── THE "IPHONE FRIENDLY" BUTTON ── */}
          <button 
            onClick={handleSave}
            className="mt-6 flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
          >
            <Share size={18} />
            <span className="text-sm font-black">Save to Photos</span>
          </button>

          <p className="mt-6 text-[11px] font-medium text-stone-500 leading-relaxed px-6">
            Tip: On iPhone, click the button then select <br/> 
            <strong className="text-stone-400">"Save Image"</strong> to put it in your gallery.
          </p>

          <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/50">
            <Heart size={12} className="fill-current" />
            Made with love by Admin
          </div>
        </div>
      </div>
    </div>
  )
}