import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()
    // Support both wishId (from your component) and wish_id
    const code = body.code
    const wish_id = body.wishId || body.wish_id 

    if (!code) return Response.json({ error: 'Missing code' }, { status: 400 })

    // 1. Fetch Coupon
    const { data: coupon, error: fetchError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (fetchError || !coupon) {
      return Response.json({ error: 'Invalid coupon code' }, { status: 404 })
    }

    // 2. Validate Limits
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return Response.json({ error: 'Coupon limit reached' }, { status: 400 })
    }

    // 3. Handle Redemption (if wish_id provided)
    if (wish_id) {
      // Check if this wish already used a coupon
      const { data: existing } = await supabase
        .from('coupon_redemptions')
        .select('id')
        .eq('wish_id', wish_id)
        .maybeSingle()

      if (existing) {
        return Response.json({ error: 'Coupon already used for this wish' }, { status: 400 })
      }

      // Link redemption
      await supabase.from('coupon_redemptions').insert([{ 
        coupon_id: coupon.id, 
        wish_id: wish_id 
      }])

      // Upgrade the wish
      await supabase.from('wishes').update({ is_premium: true }).eq('id', wish_id)
    }

    // 4. CRITICAL: Update the count
    const { error: updateError } = await supabase
      .from('coupons')
      .update({ used_count: coupon.used_count + 1 })
      .eq('id', coupon.id)

    if (updateError) throw updateError // If RLS is blocking this, it will show in logs

    return Response.json({ success: true })

  } catch (err) {
    console.error('coupon route error:', err)
    return Response.json({ error: 'Failed to apply coupon' }, { status: 500 })
  }
}