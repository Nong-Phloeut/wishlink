import QRCode from 'qrcode'
import { getOccasion } from '@/lib/occasions'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const occId = searchParams.get('occ') || 'birthday'

  if (!url) return Response.json({ error: 'url required' }, { status: 400 })

  const occ = getOccasion(occId)

  const dataUrl = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: occ.fg, light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })

  return Response.json({ dataUrl })
}
