export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Falta el ID' })

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  })

  if (!response.ok) return res.status(500).json({ error: 'Error al eliminar' })
  return res.status(200).json({ ok: true })
}
