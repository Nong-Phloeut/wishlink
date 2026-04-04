import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const { data: wish, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !wish) {
      return Response.json({ error: 'Wish not found' }, { status: 404 })
    }

    // Increment scan count (fire and forget)
    supabase
      .from('wishes')
      .update({ scans: (wish.scans || 0) + 1 })
      .eq('id', id)
      .then(() => {})

    return Response.json({ wish })
  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const { error } = await supabase.from('wishes').delete().eq('id', id)
    if (error) throw error
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
