export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?select=*&order=date.asc,time.asc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  })

  const data = await response.json()
  return res.status(200).json({ bookings: data })
}
