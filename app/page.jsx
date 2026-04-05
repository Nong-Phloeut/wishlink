'use client'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import OccasionPicker from '@/components/OccasionPicker'
import RevealCard from '@/components/RevealCard'
import BottomNav from '@/components/BottomNav'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!recipient.trim()) { toast.error('Please enter a recipient name'); return }
    if (!message.trim()) { toast.error('Please write a message'); return }
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
    setVideoFile(null); setVideoPreview(null); setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[480px] mx-auto px-4 pb-32">

        {/* Header */}
        <div className="pt-10 pb-7">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Wish<span className="text-[#1D9E75]">Link</span>
              </h1>
              <p className="text-[12px] text-stone-400 mt-0.5">Create & share beautiful wishes</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center text-xl">
              🎁
            </div>
          </div>
        </div>

        {!wish ? (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Step pills */}
            <div className="flex items-center gap-2 mb-2">
              {['Details', 'Media'].map((label, i) => {
                const s = i + 1
                const active = step === s
                const done = step > s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStep(s)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border',
                      active ? 'bg-[#1D9E75] text-white border-[#1D9E75] shadow-sm' :
                      done ? 'bg-[#F0FDF8] text-[#1D9E75] border-[#A7F3D0]' :
                      'bg-white text-stone-400 border-stone-200'
                    )}
                  >
                    <span className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold',
                      active ? 'bg-white/20 text-white' : done ? 'bg-[#1D9E75] text-white' : 'bg-stone-100 text-stone-400'
                    )}>
                      {done ? '✓' : s}
                    </span>
                    {label}
                  </button>
                )
              })}
              <div className="flex-1 h-px bg-stone-200 mx-1" />
              {(imageFiles.length > 0 || videoFile) && (
                <Badge variant="secondary" className="text-[10px] bg-[#F0FDF8] text-[#1D9E75] border-[#A7F3D0]">
                  {imageFiles.length > 0 && `${imageFiles.length} photo${imageFiles.length > 1 ? 's' : ''}`}
                  {imageFiles.length > 0 && videoFile && ' · '}
                  {videoFile && 'video'}
                </Badge>
              )}
            </div>

            {step === 1 && (
              <div className="space-y-4">

                {/* Occasion card */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-5 pb-4">
                    <Label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 block">
                      Occasion
                    </Label>
                    <OccasionPicker value={occasion} onChange={setOccasion} />
                  </CardContent>
                </Card>

                {/* Recipient + message card */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-5 space-y-4">
                    <div>
                      <Label htmlFor="recipient" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">
                        Who is this for?
                      </Label>
                      <Input
                        id="recipient"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Recipient's name"
                        maxLength={40}
                        className="border-stone-200 focus-visible:ring-[#1D9E75] focus-visible:border-[#1D9E75] bg-stone-50"
                      />
                    </div>

                    <Separator className="bg-stone-100" />

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="message" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          Your message
                        </Label>
                        <span className="text-[10px] text-stone-300">{message.length}/400</span>
                      </div>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write something heartfelt…"
                        maxLength={400}
                        rows={4}
                        className="border-stone-200 focus-visible:ring-[#1D9E75] focus-visible:border-[#1D9E75] bg-stone-50 resize-none leading-relaxed"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* From + Date card */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-5 pb-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="from" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">
                          From
                        </Label>
                        <Input
                          id="from"
                          value={fromName}
                          onChange={(e) => setFromName(e.target.value)}
                          placeholder="Your name"
                          maxLength={30}
                          className="border-stone-200 focus-visible:ring-[#1D9E75] bg-stone-50 text-[13px]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">
                          Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="border-stone-200 focus-visible:ring-[#1D9E75] bg-stone-50 text-[13px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full h-12 rounded-2xl text-[14px] font-semibold bg-[#1D9E75] hover:bg-[#178060] shadow-lg shadow-[#1D9E75]/20 transition-all active:scale-[0.98]"
                >
                  Next: Add Media →
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">

                {/* Photos card */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Photos
                      </Label>
                      <span className="text-[10px] text-stone-400">{imageFiles.length}/6</span>
                    </div>

                    {imagePreviews.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {imagePreviews.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-stone-100">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full text-[12px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {imageFiles.length < 6 && (
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors"
                          >
                            <span className="text-2xl leading-none">+</span>
                            <span className="text-[9px] mt-1">Add</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-stone-200 rounded-xl py-8 flex flex-col items-center gap-2 text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all group mb-2"
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform">🖼️</span>
                        <span className="text-[12px] font-medium">Tap to add photos</span>
                        <span className="text-[10px] opacity-60">Up to 6 photos · Max 5MB each</span>
                      </button>
                    )}
                    <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                  </CardContent>
                </Card>

                {/* Video card */}
                <Card className="border-stone-200 shadow-sm">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Video message
                      </Label>
                      <Badge variant="outline" className="text-[9px] text-stone-400 border-stone-200">optional</Badge>
                    </div>

                    {videoPreview ? (
                      <div>
                        <div className="relative rounded-xl overflow-hidden border border-stone-100">
                          <video src={videoPreview} controls className="w-full max-h-48 bg-black" />
                        </div>
                        <button
                          type="button"
                          onClick={() => { setVideoFile(null); setVideoPreview(null) }}
                          className="text-[11px] text-red-400 hover:text-red-600 transition-colors mt-2"
                        >
                          Remove video
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-stone-200 rounded-xl py-8 flex flex-col items-center gap-2 text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all group"
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform">🎥</span>
                        <span className="text-[12px] font-medium">Tap to add a video</span>
                        <span className="text-[10px] opacity-60">Max 50MB</span>
                      </button>
                    )}
                    <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-2xl border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] h-12 rounded-2xl text-[14px] font-semibold bg-[#1D9E75] hover:bg-[#178060] shadow-lg shadow-[#1D9E75]/20 transition-all active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? (uploadProgress || 'Creating…') : '✨ Generate QR Code'}
                  </Button>
                </div>
              </div>
            )}
          </form>

        ) : (
          <div ref={resultRef} className="space-y-3">

            {/* Success */}
            <div className="flex items-center gap-3 bg-[#F0FDF8] border border-[#A7F3D0] rounded-2xl px-4 py-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-[13px] font-semibold text-[#065F46]">Wish created successfully!</p>
                <p className="text-[11px] text-[#059669]">Share the QR code or link with {wish.recipient}</p>
              </div>
            </div>

            {/* QR Card */}
            <Card className="border-stone-200 shadow-sm">
              <CardContent className="pt-6 pb-5 text-center">
                <div className="relative w-48 h-48 mx-auto mb-5">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-stone-100 shadow-md">
                    {qrSrc && <img src={qrSrc} alt="QR Code" className="w-full h-full object-cover" />}
                  </div>
                  {/* Corner decorations */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#1D9E75] rounded-tl-md" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#1D9E75] rounded-tr-md" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#1D9E75] rounded-bl-md" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#1D9E75] rounded-br-md" />
                </div>

                <p className="font-semibold text-[16px] text-stone-800 mb-1">
                  {wish.recipient}'s {wish.occasion} wish
                </p>
                <p className="text-[12px] text-stone-400 mb-5">Scan with any camera to reveal</p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={copyLink}
                    className="flex-1 rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50 text-[13px]"
                  >
                    📋 Copy link
                  </Button>
                  <Button
                    onClick={shareLink}
                    className="flex-1 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-[13px]"
                  >
                    🔗 Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Button
              variant="outline"
              onClick={() => setShowPreview((p) => !p)}
              className="w-full rounded-xl border-stone-200 text-stone-500 hover:bg-stone-50 text-[13px]"
            >
              {showPreview ? '▲ Hide preview' : '👁 Preview reveal card'}
            </Button>

            {showPreview && (
              <div className="rounded-2xl overflow-hidden">
                <RevealCard wish={wish} compact />
              </div>
            )}

            <button
              onClick={reset}
              className="w-full py-2 text-[12px] text-stone-400 hover:text-stone-600 transition-colors"
            >
              ← Create another wish
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}