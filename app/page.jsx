'use client'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import OccasionPicker from '@/components/OccasionPicker'
import RevealCard from '@/components/RevealCard'
import BottomNav from '@/components/BottomNav'
import { supabase } from '@/lib/supabase'

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
  const [imageFile, setImageFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const resultRef = useRef(null)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
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
    const filename = `${folder}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('wish-media')
      .upload(filename, file, { cacheControl: '3600', upsert: false })
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
      let image_url = null
      let video_url = null

      if (imageFile) {
        setUploadProgress('Uploading image…')
        image_url = await uploadFile(imageFile, 'images')
      }
      if (videoFile) {
        setUploadProgress('Uploading video…')
        video_url = await uploadFile(videoFile, 'videos')
      }

      setUploadProgress('Creating wish…')

      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion, recipient: recipient.trim(), message: message.trim(),
          from_name: fromName.trim(), date, image_url, video_url
        }),
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
    if (navigator.share) {
      await navigator.share({ title: `A wish for ${wish.recipient}`, url })
    } else {
      copyLink()
    }
  }

  const reset = () => {
    setWish(null); setQrSrc(null); setShowPreview(false)
    setRecipient(''); setMessage(''); setFromName(''); setDate('')
    setOccasion('birthday'); setImageFile(null); setVideoFile(null)
    setImagePreview(null); setVideoPreview(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="pt-8 pb-4">
        <h1 className="font-display text-[26px] font-semibold text-gray-900">
          Wish<span className="italic text-[#1D9E75]">Link</span>
        </h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Send wishes via QR — free forever</p>
      </div>

      {!wish ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Occasion */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Occasion</label>
            <OccasionPicker value={occasion} onChange={setOccasion} />
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Recipient name</label>
            <input
              type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Sarah" maxLength={40}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e5e5e3] rounded-xl text-[14px] text-gray-800 placeholder-gray-300 outline-none focus:border-[#1D9E75] transition-colors"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Your message</label>
            <textarea
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Write something heartfelt…" maxLength={400} rows={4}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e5e5e3] rounded-xl text-[14px] text-gray-800 placeholder-gray-300 outline-none focus:border-[#1D9E75] transition-colors resize-none leading-relaxed"
            />
            <div className="text-right text-[11px] text-gray-300 mt-1">{message.length}/400</div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Photo (optional)
            </label>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[#e5e5e3] rounded-xl p-4 text-center cursor-pointer hover:border-[#1D9E75] transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
              ) : (
                <div className="text-gray-300">
                  <div className="text-3xl mb-1">🖼️</div>
                  <p className="text-[12px]">Tap to add a photo</p>
                  <p className="text-[11px] mt-0.5">Max 5MB</p>
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview && (
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="text-[11px] text-red-400 mt-1 hover:text-red-600">
                Remove photo
              </button>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Video message (optional)
            </label>
            <div
              onClick={() => videoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[#e5e5e3] rounded-xl p-4 text-center cursor-pointer hover:border-[#1D9E75] transition-colors"
            >
              {videoPreview ? (
                <video src={videoPreview} controls className="w-full rounded-lg max-h-48" />
              ) : (
                <div className="text-gray-300">
                  <div className="text-3xl mb-1">🎥</div>
                  <p className="text-[12px]">Tap to add a video</p>
                  <p className="text-[11px] mt-0.5">Max 50MB</p>
                </div>
              )}
            </div>
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
            {videoPreview && (
              <button type="button" onClick={() => { setVideoFile(null); setVideoPreview(null) }}
                className="text-[11px] text-red-400 mt-1 hover:text-red-600">
                Remove video
              </button>
            )}
          </div>

          {/* From + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">From (optional)</label>
              <input
                type="text" value={fromName} onChange={(e) => setFromName(e.target.value)}
                placeholder="Your name" maxLength={30}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e5e5e3] rounded-xl text-[14px] text-gray-800 placeholder-gray-300 outline-none focus:border-[#1D9E75] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Date (optional)</label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e5e5e3] rounded-xl text-[14px] text-gray-800 outline-none focus:border-[#1D9E75] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-medium text-[15px] text-white transition-all"
            style={{ background: loading ? '#5DCAA5' : '#1D9E75' }}
          >
            {loading ? (uploadProgress || 'Generating…') : 'Generate QR Code'}
          </button>
        </form>
      ) : (
        <div ref={resultRef} className="space-y-4">
          <div className="bg-white border border-[#e5e5e3] rounded-2xl p-5 text-center">
            <div className="w-44 h-44 mx-auto mb-4 rounded-xl overflow-hidden">
              {qrSrc && <img src={qrSrc} alt="QR Code" className="w-full h-full object-cover" />}
            </div>
            <p className="font-display text-[17px] font-semibold text-gray-800 mb-1">
              {wish.recipient}'s {wish.occasion} wish
            </p>
            <p className="text-[12px] text-gray-400 mb-4">Scan with any camera to reveal the surprise</p>
            <div className="flex gap-2 justify-center">
              <button onClick={copyLink} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium border border-[#e5e5e3] bg-[#f8f7f4] text-gray-600 hover:bg-gray-100 transition-colors">
                Copy link
              </button>
              <button onClick={shareLink} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium bg-[#1D9E75] text-white hover:bg-[#085041] transition-colors">
                Share
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowPreview((p) => !p)}
            className="w-full py-2.5 rounded-xl text-[13px] font-medium border border-[#e5e5e3] text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {showPreview ? 'Hide preview' : 'Preview reveal card'}
          </button>

          {showPreview && <RevealCard wish={wish} />}

          <button onClick={reset} className="w-full py-2.5 rounded-xl text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
            ← Create another wish
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  )
}