'use client'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

import BottomNav from '@/components/BottomNav'
import PageHeader from '@/components/create/PageHeader'
import StepIndicator from '@/components/create/StepIndicator'
import DetailsStep from '@/components/create/DetailsStep'
import MediaStep from '@/components/create/MediaStep'
import WishResult from '@/components/create/WishResult'

export default function CreatePage() {
  const tc = useTranslations('common')

  // Form state
  const [occasion, setOccasion] = useState('birthday')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [fromName, setFromName] = useState('')
  const [date, setDate] = useState('')
  const [errors, setErrors] = useState({})

  // Media state
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)

  // UI state
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [wish, setWish] = useState(null)
  const [qrSrc, setQrSrc] = useState(null)
  const resultRef = useRef(null)

  // Shared input styles
  const inputClass = cn(
    'w-full px-3 py-2.5 rounded-xl border bg-stone-50 text-stone-800 placeholder-stone-300',
    'outline-none transition-colors focus:border-[#1D9E75] focus:ring-0',
    'text-[16px] leading-normal'
  )
  const errorInputClass = 'border-red-300 focus:border-red-400 bg-red-50/30'

  // Handlers
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024)
    if (valid.length < files.length) toast.error('Some images exceed 5MB and were skipped')
    const combined = [...imageFiles, ...valid].slice(0, 6)
    setImageFiles(combined)
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)))
  }

  const handleRemoveImage = (index) => {
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

  const handleRemoveVideo = () => {
    setVideoFile(null)
    setVideoPreview(null)
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
    if (!recipient.trim()) newErrors.recipient = tc('required')
    if (!message.trim()) newErrors.message = tc('required')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goToStep2 = () => {
    if (validateStep1()) setStep(2)
  }

  const handleStepClick = (s) => {
    if (s === 2) goToStep2()
    else setStep(s)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep1()) { setStep(1); return }
    setLoading(true)
    try {
      let image_urls = []
      let video_url = null

      if (imageFiles.length > 0) {
        setUploadProgress(tc('loading'))
        image_urls = await Promise.all(imageFiles.map((f) => uploadFile(f, 'images')))
      }
      if (videoFile) {
        setUploadProgress(tc('loading'))
        video_url = await uploadFile(videoFile, 'videos')
      }

      setUploadProgress(tc('creating'))

      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion,
          recipient: recipient.trim(),
          message: message.trim(),
          from_name: fromName.trim(),
          date,
          image_urls: image_urls.length > 0 ? image_urls : null,
          video_url,
        }),
      })
      const data = await res.json()

      // Auto-save to localStorage
      const stored = JSON.parse(localStorage.getItem('my_wishes') || '[]')
      stored.unshift({
        id: data.wish.id,
        owner_token: data.owner_token,
        occasion: data.wish.occasion,
        recipient: data.wish.recipient,
        message: data.wish.message,
        created_at: data.wish.created_at,
        from_name: data.wish.from_name,
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

  const reset = () => {
    setWish(null); setQrSrc(null)
    setRecipient(''); setMessage(''); setFromName(''); setDate('')
    setOccasion('birthday'); setImageFiles([]); setImagePreviews([])
    setVideoFile(null); setVideoPreview(null); setStep(1); setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[430px] mx-auto px-4 pb-32">

        <PageHeader />

        {!wish ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <StepIndicator
              step={step}
              onStepClick={handleStepClick}
              imageCount={imageFiles.length}
              hasVideo={!!videoFile}
            />

            {step === 1 && (
              <DetailsStep
                occasion={occasion} setOccasion={setOccasion}
                recipient={recipient} setRecipient={setRecipient}
                message={message} setMessage={setMessage}
                fromName={fromName} setFromName={setFromName}
                date={date} setDate={setDate}
                errors={errors} setErrors={setErrors}
                onNext={goToStep2}
                inputClass={inputClass}
                errorInputClass={errorInputClass}
              />
            )}

            {step === 2 && (
              <MediaStep
                imageFiles={imageFiles}
                imagePreviews={imagePreviews}
                onImagesChange={handleImagesChange}
                onRemoveImage={handleRemoveImage}
                videoFile={videoFile}
                videoPreview={videoPreview}
                onVideoChange={handleVideoChange}
                onRemoveVideo={handleRemoveVideo}
                loading={loading}
                uploadProgress={uploadProgress}
                onBack={() => setStep(1)}
              />
            )}
          </form>

        ) : (
          <div ref={resultRef}>
            <WishResult
              wish={wish}
              qrSrc={qrSrc}
              onReset={reset}
            />
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}