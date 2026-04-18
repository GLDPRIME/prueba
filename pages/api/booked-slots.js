import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'Falta la fecha' })

  const { data, error } = await supabase
    .from('bookings')
    .select('time')
    .eq('date', date)

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ times: data.map(b => b.time) })
}
