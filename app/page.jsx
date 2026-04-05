'use client'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import OccasionPicker from '@/components/OccasionPicker'
import RevealCard from '@/components/RevealCard'
import BottomNav from '@/components/BottomNav'
import SaveWishPrompt from '@/components/SaveWishPrompt'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export default function CreatePage() {
  const [occasion, setOccasion] = useState('birthday')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [fromName, setFromName] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [wish, setWish] = useState(null)
  const [qrSrc, setQrSrc] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const resultRef = useRef(null)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024)
    if (valid.length < files.length) toast.error('Some images exceed 5MB and were skipped')
    const combined = [...imageFiles, ...valid].slice(0, 6)
    setImageFiles(combined)
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)))
  }

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)))
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { toast.error('Video must be under 50MB'); return }
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const uploadFile = async (file, folder) => {
    const ext = file.name.split('.').pop()
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('wish-media').upload(filename, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('wish-media').getPublicUrl(filename)
    return data.publicUrl
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!recipient.trim()) newErrors.recipient = 'Required'
    if (!message.trim()) newErrors.message = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goToStep2 = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep1()) { setStep(1); return }
    setLoading(true)
    try {
      let image_urls = []
      let video_url = null
      if (imageFiles.length > 0) {
        setUploadProgress(`Uploading ${imageFiles.length} photo${imageFiles.length > 1 ? 's' : ''}…`)
        image_urls = await Promise.all(imageFiles.map((f) => uploadFile(f, 'images')))
      }
      if (videoFile) {
        setUploadProgress('Uploading video…')
        video_url = await uploadFile(videoFile, 'videos')
      }
      setUploadProgress('Creating wish…')
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasion, recipient: recipient.trim(), message: message.trim(), from_name: fromName.trim(), date, image_urls: image_urls.length > 0 ? image_urls : null, video_url }),
      })
      const data = await res.json()

      const stored = JSON.parse(localStorage.getItem('my_wishes') || '[]')
      stored.unshift({
        id: data.wish.id,
        owner_token: data.owner_token,
        occasion: data.wish.occasion,
        recipient: data.wish.recipient,
        message: data.wish.message,
        created_at: data.wish.created_at,
      })
      localStorage.setItem('my_wishes', JSON.stringify(stored.slice(0, 50)))

      if (!res.ok) throw new Error(data.error)
      const wishUrl = `${window.location.origin}/v/${data.wish.id}`
      const qrRes = await fetch(`/api/qr?url=${encodeURIComponent(wishUrl)}`)
      const qrData = await qrRes.json()
      setWish(data.wish)
      setQrSrc(qrData.dataUrl)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
      setUploadProgress('')
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/v/${wish.id}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!')).catch(() => toast.error('Copy failed'))
  }

  const shareLink = async () => {
    const url = `${window.location.origin}/v/${wish.id}`
    if (navigator.share) await navigator.share({ title: `A wish for ${wish.recipient}`, url })
    else copyLink()
  }

  const reset = () => {
    setWish(null); setQrSrc(null); setShowPreview(false)
    setRecipient(''); setMessage(''); setFromName(''); setDate('')
    setOccasion('birthday'); setImageFiles([]); setImagePreviews([])
    setVideoFile(null); setVideoPreview(null); setStep(1); setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Shared input class — 16px font prevents iOS zoom
  const inputClass = cn(
    'w-full px-3 py-2.5 rounded-xl border bg-stone-50 text-stone-800 placeholder-stone-300',
    'outline-none transition-colors focus:border-[#1D9E75] focus:ring-0',
    'text-[16px] leading-normal' // 16px is critical — prevents iOS zoom
  )

  const errorInputClass = 'border-red-300 focus:border-red-400 bg-red-50/30'

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Prevent zoom globally via meta — add this to layout.jsx if not there */}
      <div className="max-w-[430px] mx-auto px-4 pb-32">

        {/* Header */}
        <div className="pt-8 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Wish<span className="text-[#1D9E75]">Link</span>
              </h1>
              <p className="text-[11px] text-stone-400 mt-0.5">Create & share beautiful wishes</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center text-lg">
              🎁
            </div>
          </div>
        </div>

        {!wish ? (
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-1">
              {['Details', 'Media'].map((label, i) => {
                const s = i + 1
                const active = step === s
                const done = step > s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => s === 2 ? goToStep2() : setStep(s)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border',
                      active ? 'bg-[#1D9E75] text-white border-[#1D9E75]' :
                      done ? 'bg-[#F0FDF8] text-[#1D9E75] border-[#A7F3D0]' :
                      'bg-white text-stone-400 border-stone-200'
                    )}
                  >
                    <span className={cn(
                      'w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold',
                      active ? 'bg-white/20 text-white' : done ? 'bg-[#1D9E75] text-white' : 'bg-stone-100 text-stone-400'
                    )}>
                      {done ? '✓' : s}
                    </span>
                    {label}
                  </button>
                )
              })}
              {(imageFiles.length > 0 || videoFile) && (
                <Badge className="ml-auto text-[9px] bg-[#F0FDF8] text-[#1D9E75] border border-[#A7F3D0] font-medium">
                  {imageFiles.length > 0 && `${imageFiles.length}📷`}
                  {videoFile && ' 🎥'}
                </Badge>
              )}
            </div>

            {step === 1 && (
              <div className="space-y-3">

                {/* Occasion */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Occasion</p>
                    <OccasionPicker value={occasion} onChange={setOccasion} />
                  </CardContent>
                </Card>

                {/* Recipient */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-4 pb-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          Recipient name <span className="text-red-400">*</span>
                        </label>
                        {errors.recipient && (
                          <span className="text-[10px] text-red-400 font-medium">{errors.recipient}</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => { setRecipient(e.target.value); if (errors.recipient) setErrors(p => ({...p, recipient: null})) }}
                        placeholder="e.g. Sokha, Mom, Sarah"
                        maxLength={40}
                        className={cn(inputClass, 'border-stone-200', errors.recipient && errorInputClass)}
                      />
                    </div>

                    <Separator className="bg-stone-100" />

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          Message <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {errors.message && (
                            <span className="text-[10px] text-red-400 font-medium">{errors.message}</span>
                          )}
                          <span className="text-[10px] text-stone-300">{message.length}/400</span>
                        </div>
                      </div>
                      <textarea
                        value={message}
                        onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors(p => ({...p, message: null})) }}
                        placeholder="Write something heartfelt…"
                        maxLength={400}
                        rows={4}
                        className={cn(inputClass, 'border-stone-200 resize-none leading-relaxed', errors.message && errorInputClass)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* From + Date */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">
                          From
                        </label>
                        <input
                          type="text"
                          value={fromName}
                          onChange={(e) => setFromName(e.target.value)}
                          placeholder="Your name"
                          maxLength={30}
                          className={cn(inputClass, 'border-stone-200')}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">
                          Date
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={cn(inputClass, 'border-stone-200')}
                          style={{
                            // Prevents iOS from adding extra height/padding to date inputs
                            WebkitAppearance: 'none',
                            minHeight: '46px'
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="button"
                  onClick={goToStep2}
                  className="w-full h-11 rounded-xl text-[14px] font-semibold bg-[#1D9E75] hover:bg-[#178060] shadow-md shadow-[#1D9E75]/20"
                >
                  Next: Add Media →
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">

                {/* Photos */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Photos</p>
                      <span className="text-[10px] text-stone-400">{imageFiles.length}/6</span>
                    </div>

                    {imagePreviews.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-stone-100">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >×</button>
                          </div>
                        ))}
                        {imageFiles.length < 6 && (
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors"
                          >
                            <span className="text-xl">+</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-stone-200 rounded-xl py-6 flex flex-col items-center gap-1.5 text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all"
                      >
                        <span className="text-3xl">🖼️</span>
                        <span className="text-[12px] font-medium">Tap to add photos</span>
                        <span className="text-[10px] opacity-60">Up to 6 · Max 5MB each</span>
                      </button>
                    )}
                    <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                  </CardContent>
                </Card>

                {/* Video */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Video message</p>
                      <Badge variant="outline" className="text-[9px] text-stone-400 border-stone-200 font-normal">optional</Badge>
                    </div>
                    {videoPreview ? (
                      <div>
                        <video src={videoPreview} controls className="w-full rounded-xl max-h-44 bg-black" />
                        <button type="button" onClick={() => { setVideoFile(null); setVideoPreview(null) }}
                          className="text-[11px] text-red-400 hover:text-red-600 mt-2 block">
                          Remove video
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-stone-200 rounded-xl py-6 flex flex-col items-center gap-1.5 text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all"
                      >
                        <span className="text-3xl">🎥</span>
                        <span className="text-[12px] font-medium">Tap to add a video</span>
                        <span className="text-[10px] opacity-60">Max 50MB</span>
                      </button>
                    )}
                    <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}
                    className="flex-1 h-11 rounded-xl border-stone-200 text-stone-600 text-[13px]">
                    ← Back
                  </Button>
                  <Button type="submit" disabled={loading}
                    className="flex-[2] h-11 rounded-xl text-[14px] font-semibold bg-[#1D9E75] hover:bg-[#178060] shadow-md shadow-[#1D9E75]/20 disabled:opacity-60">
                    {loading ? (uploadProgress || 'Creating…') : '✨ Generate QR'}
                  </Button>
                </div>
              </div>
            )}
          </form>

        ) : (
          <div ref={resultRef} className="space-y-3">
            <div className="flex items-center gap-3 bg-[#F0FDF8] border border-[#A7F3D0] rounded-xl px-4 py-3">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-[13px] font-semibold text-[#065F46]">Wish created!</p>
                <p className="text-[11px] text-[#059669]">Share with {wish.recipient}</p>
              </div>
            </div>
            {/* <SaveWishPrompt wish={wish} /> */}

            <Card className="border-stone-200 shadow-sm">
              <CardContent className="pt-5 pb-5 text-center">
                <div className="relative w-44 h-44 mx-auto mb-4">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-stone-100 shadow-md">
                    {qrSrc && <img src={qrSrc} alt="QR Code" className="w-full h-full object-cover" />}
                  </div>
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#1D9E75] rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#1D9E75] rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#1D9E75] rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#1D9E75] rounded-br" />
                </div>
                <p className="font-semibold text-[15px] text-stone-800 mb-1">{wish.recipient}'s {wish.occasion} wish</p>
                <p className="text-[11px] text-stone-400 mb-4">Scan with any camera to reveal</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyLink} className="flex-1 rounded-xl border-stone-200 text-stone-600 text-[13px]">📋 Copy</Button>
                  <Button onClick={shareLink} className="flex-1 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-[13px]">🔗 Share</Button>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => setShowPreview(p => !p)}
              className="w-full rounded-xl border-stone-200 text-stone-500 text-[13px]">
              {showPreview ? '▲ Hide preview' : '👁 Preview reveal card'}
            </Button>

            {showPreview && <RevealCard wish={wish} compact />}

            <button onClick={reset} className="w-full py-2 text-[12px] text-stone-400 hover:text-stone-600 transition-colors">
              ← Create another wish
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}