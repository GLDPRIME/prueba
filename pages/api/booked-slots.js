export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'Falta la fecha' })

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?select=time&date=eq.${date}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  })

  const data = await response.json()
  return res.status(200).json({ times: data.map(b => b.time) })
}
