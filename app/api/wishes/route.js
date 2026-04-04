import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(request) {
  try {
    const body = await request.json()
    const { occasion, recipient, message, from_name, date } = body

    if (!recipient || !message || !occasion) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = nanoid(8)

    const { data, error } = await supabase
      .from('wishes')
      .insert([{ id, occasion, recipient, message, from_name: from_name || null, date: date || null, scans: 0 }])
      .select()
      .single()

    if (error) throw error

    return Response.json({ wish: data }, { status: 201 })
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
