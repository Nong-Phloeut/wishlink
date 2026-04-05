import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(request) {
  try {
    const body = await request.json()
    const { occasion, recipient, message, from_name, date, image_urls, video_url } = body

    if (!recipient || !message || !occasion) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = nanoid(8)
    const owner_token = nanoid(32)

    const { data, error } = await supabase
      .from('wishes')
      .insert([{ 
        id, 
        owner_token,
        occasion, 
        recipient, 
        message, 
        from_name: from_name || null, 
        date: date || null, 
        scans: 0,
        image_urls: image_urls || null,
        video_url: video_url || null,
      }])
      .select()
      .single()

    if (error) throw error

    return Response.json({ wish: data, owner_token }, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return Response.json({ wishes: data })
  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}