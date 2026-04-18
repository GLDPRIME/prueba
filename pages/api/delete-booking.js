import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Falta el ID' })

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ ok: true })
}
