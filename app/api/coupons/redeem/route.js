import { supabase } from '@/lib/supabase'

export async function POST(request) {
  const { code, wish_id } = await request.json()

  if (!code || !wish_id) {
    return Response.json({ error: 'Missing code or wish_id' }, { status: 400 })
  }

  // 1. Find the coupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return Response.json({ error: 'Invalid coupon code' }, { status: 404 })
  }

  // 2. Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return Response.json({ error: 'This coupon has expired' }, { status: 400 })
  }

  // 3. Check max uses
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return Response.json({ error: 'This coupon has reached its limit' }, { status: 400 })
  }

  // 4. Check this wish hasn't already used a coupon
  const { data: existing } = await supabase
    .from('coupon_redemptions')
    .select('id')
    .eq('wish_id', wish_id)
    .single()

  if (existing) {
    return Response.json({ error: 'A coupon has already been used for this wish' }, { status: 400 })
  }

  // 5. Record redemption
  const { error: redeemError } = await supabase
    .from('coupon_redemptions')
    .insert([{ coupon_id: coupon.id, wish_id }])

  if (redeemError) {
    return Response.json({ error: 'Failed to redeem coupon' }, { status: 500 })
  }

  // 6. Increment used_count
  await supabase
    .from('coupons')
    .update({ used_count: coupon.used_count + 1 })
    .eq('id', coupon.id)

  // 7. Mark wish as premium
  await supabase
    .from('wishes')
    .update({ is_premium: true })
    .eq('id', wish_id)

  return Response.json({ success: true, message: 'Coupon applied!' })
}