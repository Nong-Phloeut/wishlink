'use client'
import { Heart, Coffee, Download } from 'lucide-react'

export default function AdminDonation() {
  const qrCodeUrl = "/photo_2026-04-07_15-38-11.jpg" 

  const handleDownload = () => {
    // This creates a temporary link to trigger the download
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = 'WishLink-Support-QR.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full max-w-[400px] mx-auto mt-16 mb-10 px-4">
      <div className="relative overflow-hidden rounded-[3rem] bg-stone-900 p-10 text-white shadow-2xl border border-white/5">
        
        {/* Glow Effect */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Header */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
            <Coffee size={28} />
          </div>
          
          <h3 className="text-2xl font-black tracking-tight leading-none">
            Keep WishLink Free
          </h3>
          <p className="mt-3 text-sm font-medium text-stone-400 leading-relaxed max-w-[240px]">
            If this surprise made you smile, consider supporting our servers.
          </p>

          {/* QR Area */}
          <div className="mt-8 rounded-[2.5rem] bg-white p-5 shadow-2xl ring-4 ring-white/5 relative group">
            <div className="h-64 w-64 overflow-hidden rounded-2xl bg-white">
              <img 
                src={qrCodeUrl} 
                alt="Support Admin QR" 
                className="h-full w-full object-contain"
                onError={(e) => {
                   e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=SupportWishLink"
                }}
              />
            </div>
          </div>

          {/* ── NEW: DOWNLOAD BUTTON ── */}
          <button 
            onClick={handleDownload}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all active:scale-95 group"
          >
            <Download size={18} className="text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
            <span className="text-sm font-bold text-white">Save QR Code</span>
          </button>

          <p className="mt-4 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
            Scan or save to your gallery
          </p>

          {/* Bottom Branding */}
          <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/50">
            <Heart size={12} className="fill-current" />
            Made with love by Admin
          </div>
        </div>
      </div>
    </div>
  )
}