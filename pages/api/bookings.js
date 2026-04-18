import { supabase } from '../../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, notes, date, time, profesional, servicio, precio } = req.body

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ name, email, notes, date, time, profesional, servicio, precio }])
    .select()

  if (error) return res.status(500).json({ error: error.message })

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.NOTIFY_EMAIL,
    subject: `Nueva cita — ${name} con ${profesional}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <div style="background:#1a1a2e;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
          <h1 style="color:#fff;font-size:20px;margin:0;">✂️ Nueva cita — Glen Barber</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            ${[
              ['Profesional', profesional],
              ['Servicio',    servicio],
              ['Precio',      `$${Number(precio).toLocaleString('es-CL')}`],
              ['Fecha',       date],
              ['Hora',        time],
              ['Cliente',     name],
              ['Correo',      email],
              ['Teléfono',    notes || '—'],
            ].map(([k,v]) => `
              <tr>
                <td style="padding:8px 0;color:#6b7280;width:100px;">${k}</td>
                <td style="padding:8px 0;font-weight:600;color:#1a1a2e;">${v}</td>
              </tr>
            `).join('')}
          </table>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mi-calendly.vercel.app'}/admin"
             style="display:inline-block;margin-top:20px;padding:11px 22px;background:#1a1a2e;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">
            Ver todas las citas →
          </a>
        </div>
      </div>
    `
  })

  return res.status(200).json({ ok: true, booking: data[0] })
}
