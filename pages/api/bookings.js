import { supabase } from '../../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, notes, date, time, profesional, servicio, precio } = req.body

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  // 1. Guardar en Supabase
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ name, email, notes, date, time, profesional, servicio, precio }])
    .select()

  if (error) return res.status(500).json({ error: error.message })

  // 2. Enviar correo (si falla no bloquea la reserva)
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.NOTIFY_EMAIL,
      subject: `Nueva cita — ${name} con ${profesional}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <div style="background:#1a1a2e;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
            <h1 style="color:#fff;font-size:20px;margin:0;">Nueva cita — Velvet</h1>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:8px 0;color:#6b7280;width:100px;">Profesional</td><td style="font-weight:600;">${profesional}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Servicio</td><td style="font-weight:600;">${servicio}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Precio</td><td style="font-weight:600;">$${Number(precio).toLocaleString('es-CL')}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Fecha</td><td style="font-weight:600;">${date}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Hora</td><td style="font-weight:600;">${time}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Cliente</td><td style="font-weight:600;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Correo</td><td>${email}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Teléfono</td><td>${notes || '—'}</td></tr>
            </table>
          </div>
        </div>
      `
    })
  } catch (emailError) {
    console.error('Error enviando correo:', emailError)
    // El correo falló pero la reserva ya se guardó — no bloqueamos
  }

  return res.status(200).json({ ok: true, booking: data[0] })
}
