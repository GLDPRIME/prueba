export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { name, email, notes, date, time, profesional, servicio, precio } = req.body

    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ name, email, notes, date, time, profesional, servicio, precio })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: data.message || 'Error al guardar' })
    }

    return res.status(200).json({ ok: true, booking: data[0] })

  } catch (err) {
    console.error('Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
